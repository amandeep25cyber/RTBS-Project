/**
 * analyticsService.js — real backend calls.
 * Endpoints verify the correct role via httpOnly cookie.
 */
const BASE = '/api';

export const analyticsService = {
  getPlatformStats: async () => {
    const res = await fetch(`${BASE}/analytics/platform`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch platform analytics');
    return res.json();
  },
  
  getAdvertiserStats: async () => {
    const res = await fetch(`${BASE}/analytics/advertiser`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch advertiser analytics');
    return res.json();
  },
  
  getPublisherStats: async () => {
    const res = await fetch(`${BASE}/analytics/publisher`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch publisher analytics');
    return res.json();
  }
};
