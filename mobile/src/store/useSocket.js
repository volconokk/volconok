import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL, getToken } from '../api/client';

let socket = null;

export async function ensureSocket() {
  if (socket && socket.connected) return socket;
  const token = await getToken();
  if (!token) return null;
  if (socket) socket.disconnect();
  socket = io(API_URL, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function useSocketEvent(event, handler, deps = []) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    let active = true;
    let socketInstance = null;
    const fn = (...args) => ref.current?.(...args);
    (async () => {
      const s = await ensureSocket();
      if (!s || !active) return;
      socketInstance = s;
      s.on(event, fn);
    })();
    return () => {
      active = false;
      if (socketInstance) socketInstance.off(event, fn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}
