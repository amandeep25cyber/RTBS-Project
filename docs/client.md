# RTB Platform — Frontend Specification (client.md)

This document is the single source of truth for what the frontend must look like and do.
It describes the product only — no backend exists yet. Everywhere the app needs data, it
must come from a **mock data layer** described below, structured so a real backend can be
swapped in later without touching any component code.

---

## 1. What this project is

A Real-Time Bidding (RTB) advertising platform — the same category of product as an ad
exchange connecting advertisers (demand) and publishers (supply), with an admin layer that
runs and monitors the exchange. This build is the frontend only, running entirely on
dummy/mock data, styled and structured as if a real backend were behind it.

## 2. Tech stack

- React (Vite, not Create React App)
- React Router for all navigation and route guarding
- Plain CSS or Tailwind CSS (pick one and apply it consistently — do not mix)
- No real HTTP calls anywhere. All "API calls" go through the mock service layer (see §5)
  and return Promises, so switching to real `fetch` calls later is a one-file change per
  service, not a rewrite.
- State: React Context for auth/session; local component state or Context for page data.
  No Redux needed at this scale.

## 3. Roles

Three roles exist. There is no public admin signup — admin accounts are pre-seeded in the
mock user data (see §5.1). Signup only ever offers Advertiser or Publisher.

| Role | Can do |
|---|---|
| Admin | See all auctions, all DSPs, all users, platform-wide analytics, control the traffic simulator |
| Advertiser | Manage only their own campaigns, budgets, and see only their own analytics |
| Publisher | Manage only their own ad slots and floor prices, see only their own analytics |

Role-based route guarding: each protected route checks the logged-in user's role from the
auth context and redirects to `/login` if absent, or to a "not authorized" state if the
role doesn't match the route.

## 4. Design direction

This is a real-time operations dashboard, not a marketing site — treat it like a trading
terminal crossed with a campaign manager. Avoid the generic SaaS-card look (identical
rounded cards, one grey shadow on everything, gradient accents).

- **Color**: A dark, neutral base (near-black slate, not pure black) for the dashboard
  shell, with **one** accent color used only for live/active states (e.g. a live auction
  ticking, a "winning" bid). Budgets and warnings get their own muted status colors
  (amber for pacing warnings, red only for errors/no-bid states). Advertiser and Publisher
  areas can use a lighter, calmer surface than the Admin live-feed screens, since Admin is
  the "control room" and the other two are more like account dashboards.
- **Type**: One sans-serif for UI text, and a monospace face specifically for numbers that
  update live (bids, latency, QPS, countdown timers) — this is the detail that makes it
  feel like a real trading/auction system rather than a generic dashboard.
- **Layout**: Left sidebar for primary navigation (role-aware — shows only that role's
  pages), top bar with account/profile menu. Live data (auction feed) uses a dense table/
  list, not big cards — density signals "real system" here.
- Numbered steps/eyebrow labels only where content is genuinely sequential (the signup
  wizard). Don't decorate ordinary pages with them.

## 5. Mock data layer

All mock data lives in `src/mocks/` as plain JS/JSON modules. All access goes through
`src/services/` functions that return `Promise.resolve(data)` (with an artificial
`setTimeout` of ~300-600ms to simulate network latency and force loading states to be
built correctly). Each service file is named after the resource it will one day fetch from
a real API, e.g. `campaignService.js`, `auctionService.js` — this is what makes the future
backend swap a one-file change.

### 5.1 Users (`src/mocks/users.js`)
```json
[
  { "id": "u1", "name": "Admin User", "email": "admin@platform.com", "password": "admin123", "role": "admin" },
  { "id": "u2", "name": "Priya Sharma", "email": "priya@nikeindia.com", "password": "pass123", "role": "advertiser", "companyName": "Nike India", "industry": "e-commerce" },
  { "id": "u3", "name": "Rahul Mehta", "email": "rahul@indianexpress.com", "password": "pass123", "role": "publisher", "websiteName": "Indian Express", "websiteUrl": "indianexpress.com", "category": "news" }
]
```
New signups get appended to this array in memory (state, not persisted to disk — a page
refresh resets to the seed data, which is acceptable for a dummy build).

### 5.2 Campaigns (`src/mocks/campaigns.js`) — owned by advertisers
```json
[
  { "id": "c1", "advertiserId": "u2", "name": "Summer Sale", "dailyBudget": 10000, "spentToday": 6400, "maxBid": 2.5, "targeting": { "geo": "IN", "device": "mobile" }, "frequencyCap": 5, "status": "active" }
]
```

### 5.3 Ad slots (`src/mocks/slots.js`) — owned by publishers
```json
[
  { "id": "s1", "publisherId": "u3", "slotName": "Homepage banner", "floorPrice": 0.5, "fillRate": 0.82, "revenueToday": 1240, "status": "active" }
]
```

### 5.4 DSP bidders (`src/mocks/dsps.js`) — admin view only
```json
[
  { "id": "dsp1", "name": "DSP-1", "totalBids": 4210, "wins": 980, "avgLatencyMs": 34, "status": "healthy" }
]
```

### 5.5 Live auctions (`src/mocks/auctions.js`) — generated, not static
A function `generateAuctionEvent()` that returns one fake auction result (winner DSP,
winning bid, latency, timestamp, no-bid or not). The Live Auction Feed page calls this on
an interval (see §6.2) to fake real-time activity — this is the one page allowed to have
"live" client-side simulation logic, since there is no backend pushing real events yet.

### 5.6 Analytics (`src/mocks/analytics.js`)
Static arrays of time-series numbers (last 24 hourly points) for: spend over time, latency
p50/p95/p99, win rate over time — enough to draw charts on the Admin, Advertiser, and
Publisher analytics pages.

## 6. Pages

### 6.1 Public
- **Login** — email + password, checked against `src/mocks/users.js`. On success, sets the
  logged-in user in auth context and redirects by role: admin → `/admin/feed`,
  advertiser → `/advertiser/dashboard`, publisher → `/publisher/dashboard`.
- **Signup (3-step wizard)** —
  - Step 1: choose Advertiser or Publisher (no Admin option — see §3)
  - Step 2: name, email, password, confirm password (client-side validation: valid email
    format, passwords match, password ≥ 8 chars)
  - Step 3: role-specific fields (Advertiser: company name, industry, starting budget /
    Publisher: website name, URL, category). Submitting appends the new user to the mock
    users array and logs them in.

### 6.2 Admin
- **Live Auction Feed** (`/admin/feed`) — scrolling list of auction events generated every
  1-2s from `generateAuctionEvent()`; header shows auctions/sec, no-bid count.
- **DSP Performance** (`/admin/dsps`) — table + bar chart of each DSP's win rate and
  latency from `src/mocks/dsps.js`.
- **User Management** (`/admin/users`) — list of all advertisers/publishers, with a mock
  "block/unblock" toggle (updates in-memory state only).
- **Platform Analytics** (`/admin/analytics`) — charts from `src/mocks/analytics.js`:
  total spend, latency percentiles, win rate, all platform-wide.
- **Simulator Control** (`/admin/simulator`) — start/stop button and a load slider that
  changes how often `generateAuctionEvent()` fires on the feed page (store this rate in
  shared context so the feed page reacts to it).

### 6.3 Advertiser
- **Dashboard** (`/advertiser/dashboard`) — summary cards: active campaigns, total spend
  today, overall win rate, filtered to `advertiserId === currentUser.id`.
- **Campaign Management** (`/advertiser/campaigns`) — list of own campaigns with a budget
  progress bar per campaign; a form to create/edit a campaign (name, daily budget, max
  bid, geo, device targeting, frequency cap).
- **Analytics** (`/advertiser/analytics`) — own spend-over-time and win-rate charts only.

### 6.4 Publisher
- **Dashboard** (`/publisher/dashboard`) — summary cards: active slots, fill rate,
  revenue today, filtered to `publisherId === currentUser.id`.
- **Slot Management** (`/publisher/slots`) — list of own slots; form to add/edit a slot
  (slot name, floor price).
- **Analytics** (`/publisher/analytics`) — own revenue and fill-rate charts only.

### 6.5 Shared
- **Profile/Settings** (`/profile`) — available to all roles; edit name/email, change
  password (updates the in-memory mock user record), logout button.

## 7. Routing map (for reference)

```
/login
/signup
/admin/feed | /admin/dsps | /admin/users | /admin/analytics | /admin/simulator
/advertiser/dashboard | /advertiser/campaigns | /advertiser/analytics
/publisher/dashboard | /publisher/slots | /publisher/analytics
/profile
```

## 9. Polish & quality upgrades (phase 2)

These are not required for the app to function, but are what take it from "working" to
"impressive." Build them only after all 25 steps in §6 are done and stable, in the order
given in agent.md, since a few of these (TypeScript) touch every existing file and are
easiest to do in one clean pass rather than repeatedly.

### 9.1 Real-time feel
- New rows on the Live Auction Feed animate in (slide/fade), with a brief highlight flash
  that fades over ~1s, instead of appearing instantly.
- Live numbers (QPS counter, spend totals) animate their count change rather than jumping
  straight to the new value.
- A small pulsing "Live" indicator dot next to the feed header.

### 9.2 Data visualization upgrades
- Latency should be shown as a distribution (separate p50/p95/p99 bars), not a single
  average number.
- Budget pacing gets an area chart with two lines: a dashed "ideal pacing" line and a
  solid "actual spend" line, so over/under-spend is visible at a glance.

### 9.3 Loading & empty states
- Replace plain "Loading..." text everywhere with skeleton loaders shaped like the content
  that's about to appear.
- Empty states (e.g. an advertiser with zero campaigns) include a short helpful message
  and a direct action button (e.g. "Create your first campaign"), not just "No data."

### 9.4 Toast notifications
- A toast/snackbar system for feedback on every create/edit/delete action (campaigns,
  slots, profile changes, user block/unblock) — success and error variants.

### 9.5 Theme toggle
- Dark theme (per §4) stays the default; add a toggle in the top bar for a light variant
  using the same design tokens.

### 9.6 Accessibility & keyboard support
- All forms have proper `<label>` associations and are fully usable via keyboard/Tab.
- The Live Auction Feed uses an `aria-live` region so new entries are announced to screen
  readers, not just visually inserted.

### 9.7 TypeScript conversion
- Convert the whole codebase from JS/JSX to TS/TSX. Define types for every mock data shape
  in §5 (User, Campaign, Slot, Dsp, AuctionEvent) and type every service function's
  parameters and return values, and every component's props.

### 9.8 Route-based code splitting
- Lazy-load each role's route group (Admin / Advertiser / Publisher) so a logged-in
  advertiser's browser never downloads the Admin bundle, and vice versa.

### 9.9 Command palette
- A Cmd/Ctrl+K palette that lets any role jump directly to their own pages by typing,
  instead of only navigating via the sidebar.

## 10. Explicitly out of scope for this build

No real backend, no real auth/JWT/cookies, no real database, no payment integration.
These come in a later phase once this frontend is approved.
