/**
 * slotService.js — real backend calls.
 * All routes require the publisher's httpOnly cookie.
 */
const BASE = '/api';

export const slotService = {
  /** GET /slots — own slots only */
  getByPublisher: async () => {
    const res = await fetch(`${BASE}/slots`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch slots');
    return res.json(); // array of slots
  },

  /** POST /slots */
  create: async (slotData) => {
    const res = await fetch(`${BASE}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(slotData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create slot');
    }
    return res.json();
  },

  /** PUT /slots/:id */
  update: async (id, data) => {
    const res = await fetch(`${BASE}/slots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update slot');
    }
    return res.json();
  },
};
