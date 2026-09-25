# RTBS (Real-Time Bidding System) - Frontend MVP

This project is a React-based frontend prototype for a Real-Time Bidding (RTB) platform. It provides tailored dashboard experiences for three distinct roles: **Admin**, **Advertiser**, and **Publisher**.

The platform is designed with a premium, data-dense aesthetic optimized for technical B2B users, using a dark mode theme, Recharts for data visualization, and Tailwind CSS v4.

## Features & Implementation

### Three-Role Architecture
1. **Admin**: Has platform-wide visibility. Can monitor the live auction feed, manage Demand-Side Platforms (DSPs), manage users (block/unblock), and view platform-wide analytics.
2. **Advertiser**: Can manage their campaigns, view daily spend, and track win rates.
3. **Publisher**: Can manage their ad inventory (slots), set floor prices, and view fill rates and revenue.

### Mock Service Layer
This is a **frontend-only** implementation. All data that would normally come from a backend API is managed by a robust mock service layer located in `src/services/` and `src/mocks/`. 
- Responses are Promise-based with simulated network latency (300-600ms).
- Mock data includes realistic values for DSPs, campaigns, users, ad slots, and historical analytics.

### Real-Time Synthetic Traffic Simulator
To demonstrate the "Real-Time" aspect of RTB, the application includes a synthetic traffic generator:
1. Log in as an **Admin** (`admin@rtb.com`).
2. Navigate to **Simulator Control** to adjust the global query-per-second (QPS) rate or stop/start the engine.
3. Navigate to the **Live Auction Feed** to watch synthetic bid requests and auction resolutions populate the log at the exact rate configured in the simulator.

### Authentication & State
The app uses a top-level `AuthContext` to manage the authenticated user's state. 
- Login routes bypass the app shell.
- Protected routes filter access strictly by role, redirecting unauthorized users.

## How to Run

1. Make sure you have Node.js installed.
2. Navigate to the `client` directory:
   ```bash
   cd client
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Test Accounts
You can log in using any of the following mock accounts (password is `password` for all):

- **Admin**: `admin@rtb.com`
- **Advertiser**: `adv@company.com` (or create a new one via Signup)
- **Publisher**: `pub@news.com` (or create a new one via Signup)

## Design Notes & Shortcuts Taken
- **Local State**: State changes (like creating a campaign or blocking a user) are maintained in-memory for the duration of the session. A page reload will reset data to the initial mock state.
- **Charts**: We use `recharts` to render historical analytics data (spend, latency percentiles, win rates, and fill rates). The data is mocked to look like a realistic 24-hour cycle.
- **Form Validation**: Simple client-side validation is implemented for Signup, Profile, and Campaign/Slot creation forms.
- **Routing**: Handled by `react-router-dom` with role-based Route Guards (`<ProtectedRoute>`).
- **Icons**: Provided by `lucide-react`.

## Project Structure
```text
client/
├── public/
├── src/
│   ├── components/      # Reusable UI (Layout, Sidebar, Topbar, ProtectedRoute)
│   ├── context/         # AuthContext, SimulatorContext
│   ├── mocks/           # Mock data files (users, campaigns, dsps, slots, etc.)
│   ├── pages/           # Page components (Dashboards, Analytics, Management, Feed)
│   ├── services/        # Mock API services (async wrappers over mock data)
│   ├── App.jsx          # Router setup
│   ├── index.css        # Tailwind tokens and base styles
│   └── main.jsx         # Entry point
```

---
*Built as a frontend MVP for the RTBS Project.*
