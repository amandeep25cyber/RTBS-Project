/**
 * walletService.js — real backend calls.
 * All routes require the advertiser's httpOnly cookie.
 */
const BASE = '/api';

export const walletService = {
  /** GET /wallet/transactions */
  getTransactions: async (page = 1, limit = 20) => {
    const res = await fetch(`${BASE}/wallet/transactions?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    return data.transactions;
  },

  /** GET /wallet/balance (Wait, the backend doesn't have an explicit endpoint for balance? Let me check server.md or auth me) */
  getBalance: async () => {
    // Actually, balance is available on the user object from GET /auth/me
    // But let's fetch it via auth me to be safe, or just provide a dedicated mock for now
    const res = await fetch(`${BASE}/auth/me`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch balance');
    const user = await res.json();
    return user.walletBalance || 0;
  },

  /** POST /wallet/add-funds */
  addFunds: async (amount) => {
    const res = await fetch(`${BASE}/wallet/add-funds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to initialize payment');
    }
    return res.json();
  }
};
