# Agent instructions (agent.md)

You are building the frontend-only version of an RTB advertising platform, described fully
in `client.md`. Read `client.md` first — it is the spec for every page, role, and piece of
mock data referenced below. This file only tells you the order to build things in and the
ground rules to follow while doing it.

## Ground rules

1. No backend. Every place data would normally come from an API must go through the mock
   service layer described in client.md §5 — a function in `src/services/` that returns a
   Promise resolving to data from `src/mocks/`. Never inline mock data directly in a
   component; always go through a service function, even though today it just returns a
   local array. This is what makes the later backend swap safe.
2. Build one step at a time, in the order below. Do not skip ahead to a later step's page
   before the steps it depends on are done (e.g. don't build Campaign Management before
   the auth context and routing exist).
3. After each step, the app should still run without errors — don't leave a step half-done
   across a commit boundary.
4. Follow the design direction in client.md §4 consistently across every page — same
   sidebar, same top bar, same color system — rather than restyling per page.
5. Use the exact mock data shapes given in client.md §5. If a page needs a field not listed
   there, add it to the relevant mock file and note it, rather than hardcoding it in the
   component.
6. After finishing each step below and confirming the app still runs without errors,
   commit and push that step's code to GitHub before moving to the next step. Use a
   commit message in the form `Step N: <short description>` (e.g. `Step 8: add login
   page`), so the commit history on GitHub becomes a readable log of the build order —
   this doubles as proof of incremental, working progress if shown in an interview.

## Build order — 25 steps

1. Scaffold the project with Vite + React + React Router. Set up the folder structure:
   `src/pages`, `src/components`, `src/mocks`, `src/services`, `src/context`.
2. Set up the styling approach (Tailwind or plain CSS — pick one) and define the base
   design tokens from client.md §4: colors, the two type faces (UI sans + numeric mono),
   spacing scale.
3. Create all mock data files in `src/mocks/`: `users.js`, `campaigns.js`, `slots.js`,
   `dsps.js`, `auctions.js` (including the `generateAuctionEvent()` function), and
   `analytics.js`, using the exact shapes in client.md §5.
4. Create matching service files in `src/services/` (`authService.js`,
   `campaignService.js`, `slotService.js`, `dspService.js`, `auctionService.js`,
   `analyticsService.js`, `userService.js`), each wrapping its mock file in a
   Promise-returning function with a simulated delay.
5. Build the auth context (`src/context/AuthContext.jsx`): holds the logged-in user and
   role, exposes `login()`, `logout()`, `signup()`, backed by `authService.js`.
6. Set up the full route tree from client.md §7, with role-based route guarding: an
   unauthenticated user hitting any protected route redirects to `/login`; a wrong-role
   user hitting another role's route gets a "not authorized" state, not a crash.
7. Build the shared app shell: role-aware sidebar (shows only the current role's pages)
   and top bar with a profile/account menu.
8. Build the Login page (client.md §6.1): email/password form, validates against
   `authService`, redirects by role on success, shows an error state on failure.
9. Build Signup Step 1: the Advertiser/Publisher role-choice cards, with the step
   progress indicator. No Admin option.
10. Build Signup Step 2: name/email/password/confirm-password fields with client-side
    validation (email format, password length, passwords match). Preserve Step 1's
    choice when navigating back.
11. Build Signup Step 3: role-specific fields branching on the Step 1 choice
    (Advertiser vs Publisher fields per client.md §6.1). Submitting calls
    `authService.signup()`, logs the user in, and redirects by role.
12. Build the Admin Live Auction Feed page: scrolling event list driven by
    `generateAuctionEvent()` on an interval, with the auctions/sec and no-bid counters.
13. Build the Admin DSP Performance page: table and bar chart from `dspService`.
14. Build the Admin User Management page: list of advertisers/publishers with a working
    (in-memory) block/unblock toggle.
15. Build the Admin Platform Analytics page: charts from `analyticsService` (spend,
    latency percentiles, win rate — platform-wide).
16. Build the Admin Simulator Control page: start/stop and load slider, wired via shared
    context so the Live Auction Feed page's event rate actually changes when this is
    adjusted.
17. Build the Advertiser Dashboard: summary cards scoped to the logged-in advertiser's
    own campaigns only.
18. Build the Advertiser Campaign Management page: list with budget progress bars, plus
    a create/edit campaign form (name, daily budget, max bid, geo, device, frequency cap).
19. Build the Advertiser Analytics page: charts scoped to the logged-in advertiser only.
20. Build the Publisher Dashboard: summary cards scoped to the logged-in publisher's own
    slots only.
21. Build the Publisher Slot Management page: list with an add/edit slot form (slot name,
    floor price).
22. Build the Publisher Analytics page: charts scoped to the logged-in publisher only.
23. Build the shared Profile/Settings page: edit name/email, change password, logout —
    available from all three roles' top bars.
24. Pass over every page: add loading states while the simulated service delay is in
    flight, and empty states where a list could be empty (e.g. a brand-new advertiser
    with zero campaigns). Check responsive behavior down to mobile width.
25. Final integration check: confirm every component gets its data only through a
    `src/services/` function (never a direct mock import), so that later swapping each
    service function's body for a real `fetch` call is the only change needed to connect
    the real backend.

## Phase 2 — Polish (only start after step 25 is stable and pushed)

Each step below maps to the matching subsection in client.md §9. Do them in this order —
TypeScript is placed first in this phase specifically so every step after it is written
in TS/TSX from the start, instead of being converted twice.

26. Convert the entire codebase from JS/JSX to TS/TSX (client.md §9.7): add types for
    every mock data shape (User, Campaign, Slot, Dsp, AuctionEvent) and type every service
    function's parameters/return values and every component's props. Do this in one full
    pass across all existing files, then commit and push before continuing.
27. Add the real-time feel enhancements to the Live Auction Feed (client.md §9.1):
    slide/fade-in with a fading highlight flash for new rows, animated count-up for live
    numbers (QPS, spend), and a pulsing "Live" indicator.
28. Upgrade the analytics charts (client.md §9.2): split latency into p50/p95/p99 bars
    instead of one average, and add the budget pacing area chart with an "ideal" dashed
    line against the "actual" solid line.
29. Replace loading text with skeleton loaders and upgrade empty states to include a
    helpful message plus a direct action button, across every page (client.md §9.3).
30. Build a toast/snackbar notification system and wire it into every create/edit/delete
    action across Campaign Management, Slot Management, Profile, and User Management
    (client.md §9.4), with distinct success and error styles.
31. Add a light/dark theme toggle in the top bar, dark as the default, reusing the design
    tokens from client.md §4 (client.md §9.5).
32. Do an accessibility pass: label every form field properly, verify full keyboard
    navigation end to end, and add an `aria-live` region to the Live Auction Feed
    (client.md §9.6).
33. Add route-based code splitting so each role's route group (Admin / Advertiser /
    Publisher) lazy-loads independently (client.md §9.8).
34. Add a Cmd/Ctrl+K command palette for jumping directly to any of the current role's
    pages (client.md §9.9).

Push each of these steps to GitHub individually, same as phase 1, using the
`Step N: <short description>` commit message format from Ground rule 6.
