import type { User } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const authStore = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setAuth: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};
