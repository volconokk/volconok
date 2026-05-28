const jwt = require('jsonwebtoken');
const User = require('../models/User');

let ioRef = null;
const userSockets = new Map();

function touchLastSeen(userId) {
  User.updateOne({ _id: userId }, { $set: { lastSeenAt: new Date() } }).catch(() => {});
}

function initSocket(io) {
  ioRef = io;
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization || '').replace('Bearer ', '');
      if (!token) return next(new Error('No token'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.sub;
      return next();
    } catch (err) {
      return next(new Error('Auth failed'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.userId;
    if (!uid) return;
    const set = userSockets.get(uid) || new Set();
    set.add(socket.id);
    userSockets.set(uid, set);

    socket.join(`user:${uid}`);
    touchLastSeen(uid);
    // Let others know this user just came online.
    socket.broadcast.emit('presence', { userId: uid, online: true });

    socket.on('typing', ({ to, typing }) => {
      if (to) io.to(`user:${to}`).emit('typing', { from: uid, typing: !!typing });
    });

    socket.on('disconnect', () => {
      const s = userSockets.get(uid);
      if (s) {
        s.delete(socket.id);
        if (s.size === 0) {
          userSockets.delete(uid);
          touchLastSeen(uid);
          socket.broadcast.emit('presence', { userId: uid, online: false });
        }
      }
    });
  });
}

function isUserOnline(userId) {
  const set = userSockets.get(String(userId));
  return !!(set && set.size > 0);
}

function emitToUser(userId, event, payload) {
  if (!ioRef) return;
  ioRef.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, emitToUser, isUserOnline };
