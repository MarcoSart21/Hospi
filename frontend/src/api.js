/**
 * api.js — Helper para llamadas al backend.
 * Lee la URL base desde VITE_API_URL.
 * Adjunta el JWT almacenado en localStorage en cada petición.
 */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });

  // Si el servidor responde 401, la sesión expiró → limpiar y redirigir
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, data) => request(path, { method: 'POST',   body: JSON.stringify(data) }),
  put:    (path, data) => request(path, { method: 'PUT',    body: JSON.stringify(data) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
};

/** Helpers de sesión */
export const auth = {
  login: async (username, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
    // const res = await fetch(`${BASE}/login`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
};
