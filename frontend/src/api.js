/**
 * api.js — Helper para llamadas al backend.
 * Usa el ALB con /api routing.
 */

const BASE = import.meta.env.VITE_API_URL || '/api';

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

  // Manejo de sesión expirada
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
    post:   (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
    put:    (path, data) => request(path, { method: 'PUT',  body: JSON.stringify(data) }),
    delete: (path)       => request(path, { method: 'DELETE' }),
};

export const auth = {
    login: async (username, password) => {
    const data = await api.post('/login', { username, password });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getUser: () => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    },

    isAuthenticated: () => !!localStorage.getItem('token'),
};