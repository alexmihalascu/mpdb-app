/**
 * Thin fetch wrapper around the MPDB API.
 *
 * Every call goes to a same-origin `/api/...` path (Vite proxies it to Flask
 * in development) and sends credentials, so the httpOnly session cookie is
 * attached automatically. Nothing here ever touches localStorage: the session
 * token is deliberately unreadable from JavaScript.
 */

const BASE = '/api';

/** An error carrying the HTTP status and any per-field messages from the API. */
export class ApiError extends Error {
  constructor(message, { status, fields } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields ?? {};
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause;
    throw new ApiError(
      'Nu putem contacta serverul. Verifica daca API-ul ruleaza pe portul 5000.',
      { status: 0 },
    );
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(payload?.error ?? `Cererea a esuat (${response.status}).`, {
      status: response.status,
      fields: payload?.fields,
    });
  }

  return payload;
}

export const api = {
  // Auth
  me: (signal) => request('/auth/me', { signal }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  register: (username, password) =>
    request('/auth/register', { method: 'POST', body: { username, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/password', { method: 'POST', body: { currentPassword, newPassword } }),

  // Catalog
  cars: (signal) => request('/cars', { signal }),

  // Rentals
  createRental: (booking) => request('/rentals', { method: 'POST', body: booking }),
  myRentals: (signal) => request('/rentals', { signal }),
  cancelRental: (id) => request(`/rentals/${id}`, { method: 'DELETE' }),
};
