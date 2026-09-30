/**
 * authService.js — real backend calls via /api proxy.
 * Cookies are managed entirely by the server (httpOnly).
 * We never touch localStorage for auth state after this swap.
 */
const BASE = '/api';

export const authService = {
  /**
   * POST /auth/login
   * Returns the logged-in user object on success.
   * The server sets the httpOnly cookie; we just read the JSON body.
   */
  login: async (email, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',       // send/receive cookies
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json(); // { user }
  },

  /**
   * POST /auth/signup
   * Server sets cookie on success.
   */
  signup: async (userData) => {
    const res = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Signup failed');
    }
    return res.json(); // { user }
  },

  /**
   * POST /auth/logout
   * Server clears cookie.
   */
  logout: async () => {
    await fetch(`${BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  /**
   * GET /auth/me
   * Verify the cookie is still valid; returns the current user or throws.
   * Used on page load to restore session without localStorage.
   */
  me: async () => {
    const res = await fetch(`${BASE}/auth/me`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json(); // { user }
  },
};
