import { writable } from 'svelte/store';
import type { User } from '$lib/types';

type AuthState = {
  token: string | null;
  expiresAt: string | null;
  user: User | null;
  status: 'loading' | 'authenticated' | 'anonymous';
};

const initial: AuthState = {
  token: null,
  expiresAt: null,
  user: null,
  status: 'loading'
};

export const auth = writable<AuthState>(initial);

export function hydrateAuth() {
  const token = sessionStorage.getItem('obi_access_token');
  const userRaw = sessionStorage.getItem('obi_user');
  auth.set({
    token,
    expiresAt: sessionStorage.getItem('obi_token_expires_at'),
    user: userRaw ? JSON.parse(userRaw) : null,
    status: token ? 'authenticated' : 'anonymous'
  });
}

export function setAuth(token: string, expiresAt: string | null, user: User) {
  sessionStorage.setItem('obi_access_token', token);
  sessionStorage.setItem('obi_user', JSON.stringify(user));
  if (expiresAt) sessionStorage.setItem('obi_token_expires_at', expiresAt);
  auth.set({ token, expiresAt, user, status: 'authenticated' });
}

export function clearAuth() {
  sessionStorage.removeItem('obi_access_token');
  sessionStorage.removeItem('obi_token_expires_at');
  sessionStorage.removeItem('obi_user');
  auth.set({ ...initial, status: 'anonymous' });
}
