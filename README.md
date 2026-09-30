# Real-Time Bidding System (RTBS)

A full-stack Node.js + React platform demonstrating a mock real-time bidding ecosystem. It supports three user roles:
- **Advertisers**: Can create target-based campaigns, deposit funds, and view real-time spend analytics.
- **Publishers**: Can register web slots, earn revenue when ads are shown, and view payout analytics.
- **Admins**: Can view the live socket-based auction feed, ban users, and view platform revenue.

## Architecture Summary

- **Frontend**: React + Vite + React Router. Uses a `SocketProvider` for real-time live feed events and standard `fetch` with `credentials: 'include'` for secure `httpOnly` cookie-based session management.
- **Backend (API)**: Express.js REST API with Mongoose (MongoDB). Exposes endpoints for authentication, entity CRUD (Campaigns/Slots), Wallet handling, and paginated data tables.
- **Auction Engine**: Pure JavaScript business logic. Evaluates eligible campaigns, resolves ties via deterministic hashing, handles atomic budget deduction (preventing race conditions via `$inc` and freq-cap validations), and writes to the ledger.
- **Real-Time Feed**: Node `socket.io` server emits events whenever an auction completes or a slot is blocked.
- **Background Jobs**: Powered by `BullMQ` + Redis.
  - `hourlyRollupJob`: Aggregates raw auction logs into hourly metrics.
  - `fraudScanJob`: Checks for abnormally high-frequency slot requests.
  - `payoutJob`: Weekly simulates paying out publishers their earnings.

## Setup Instructions

### Local Development (Docker)

This is the easiest way to run the entire stack.

1. **Clone the repository.**
2. **Environment variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *(Update the values in `.env` if you have real Razorpay sandbox keys or a remote MongoDB cluster, otherwise defaults work for docker)*
3. **Start the stack**:
   ```bash
   docker-compose up --build
   ```
4. **Access the platform**:
   - Frontend is available at `http://localhost:5173`
   - Backend is available at `http://localhost:5000`

### Local Development (Manual)

If you prefer to run services manually on your host machine:

1. **Prerequisites**: Ensure MongoDB and Redis are running locally.
2. **Environment setup**: Create a `.env` in the `server` directory and configure `MONGO_URI` and `REDIS_HOST`.
3. **Run Server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *(Ensure you also run the worker process: `node worker.js` in a separate terminal)*
4. **Run Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
