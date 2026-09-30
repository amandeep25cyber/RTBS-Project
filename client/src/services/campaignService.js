/**
 * campaignService.js — real backend calls.
 * All routes require the advertiser's httpOnly cookie.
 */
const BASE = '/api';

export const campaignService = {
  /** GET /campaigns — own campaigns only */
  getByAdvertiser: async () => {
    const res = await fetch(`${BASE}/campaigns`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json(); // array of campaigns
  },

  /** POST /campaigns */
  create: async (campaignData) => {
    const res = await fetch(`${BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(campaignData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create campaign');
    }
    return res.json();
  },

  /** PUT /campaigns/:id */
  update: async (id, data) => {
    const res = await fetch(`${BASE}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update campaign');
    }
    return res.json();
  },
};
