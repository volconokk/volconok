import { create } from 'zustand';
import { api, getToken, setToken } from '../api/client';

export const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  async bootstrap() {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) {
        set({ user: null, loading: false });
        return null;
      }
      const { data } = await api.get('/auth/me');
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      console.log('Bootstrap error:', err?.displayMessage || err?.message);
      await setToken(null);
      set({ user: null, loading: false, error: err?.displayMessage || 'Auth error' });
      return null;
    }
  },

  async login({ login, password }) {
    console.log('[Auth] Login started:', login);
    set({ error: null, loading: true });
    try {
      console.log('[Auth] Sending POST /auth/login...');
      const { data } = await api.post('/auth/login', { login, password });
      console.log('[Auth] Login response received');
      await setToken(data.token);
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      console.log('[Auth] Login error:', err?.displayMessage || err?.message);
      set({ error: err?.displayMessage || 'Login error', loading: false });
      throw err;
    }
  },

  async register({ username, email, password, displayName }) {
    set({ error: null, loading: true });
    try {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password,
        displayName,
      });
      await setToken(data.token);
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      set({ error: err?.displayMessage || 'Register error', loading: false });
      throw err;
    }
  },

  async logout() {
    await setToken(null);
    set({ user: null, loading: false, error: null });
  },

  async updateProfile(patch) {
    try {
      const { data } = await api.patch('/users/me', patch);
      set({ user: data.user });
      return data.user;
    } catch (err) {
      console.log('updateProfile error:', err?.displayMessage);
      throw err;
    }
  },

  async updateSettings(patch) {
    try {
      const { data } = await api.patch('/users/me/settings', patch);
      const currentUser = get().user;
      set({ user: { ...currentUser, settings: data.settings } });
      return data.settings;
    } catch (err) {
      console.log('updateSettings error:', err?.displayMessage);
      throw err;
    }
  },
}));
