import { create } from 'zustand';
import { api } from '../api/client';

// Tracks unread counts for the messages tab and the notifications bell.
// Refreshed on app focus and whenever a relevant socket event arrives.
export const useBadges = create((set) => ({
  messages: 0,
  notifications: 0,

  async refresh() {
    try {
      const [m, n] = await Promise.all([
        api.get('/messages/unread-count'),
        api.get('/notifications/unread-count'),
      ]);
      set({ messages: m.data.count || 0, notifications: n.data.count || 0 });
    } catch (_e) {
      // ignore — badges are non-critical
    }
  },

  async refreshMessages() {
    try {
      const { data } = await api.get('/messages/unread-count');
      set({ messages: data.count || 0 });
    } catch (_e) {
      // ignore
    }
  },

  async refreshNotifications() {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ notifications: data.count || 0 });
    } catch (_e) {
      // ignore
    }
  },

  clearMessages() {
    set({ messages: 0 });
  },

  clearNotifications() {
    set({ notifications: 0 });
  },

  reset() {
    set({ messages: 0, notifications: 0 });
  },
}));
