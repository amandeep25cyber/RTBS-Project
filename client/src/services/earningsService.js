/**
 * earningsService.js — real backend calls.
 * All routes require the publisher's httpOnly cookie.
 */
const BASE = '/api';

export const earningsService = {
  /** GET /earnings/balance */
  getBalance: async () => {
    const res = await fetch(`${BASE}/earnings/balance`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch balance');
    const data = await res.json();
    return data.balance || 0;
  },

  /** GET /earnings/transactions */
  getTransactions: async (page = 1, limit = 20) => {
    const res = await fetch(`${BASE}/earnings/transactions?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    return data.transactions;
  },

  /** GET /earnings/payouts */
  getPayouts: async (page = 1, limit = 20) => {
    const res = await fetch(`${BASE}/earnings/payouts?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch payouts');
    const data = await res.json();
    return data.payouts;
  },
};
