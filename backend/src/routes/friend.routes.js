const express = require('express');
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { emitToUser } = require('../realtime/socket');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [{ requester: req.userId }, { recipient: req.userId }],
    });
    const ids = friendships.map((f) =>
      f.requester.equals(req.userId) ? f.recipient : f.requester,
    );
    const users = await User.find({ _id: { $in: ids } }).lean();
    res.json({
      friends: users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        displayName: u.displayName || u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        lastSeenAt: u.lastSeenAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/requests', authRequired, async (req, res, next) => {
  try {
    const incoming = await Friendship.find({ recipient: req.userId, status: 'pending' }).populate(
      'requester',
      'username displayName avatarUrl',
    );
    const outgoing = await Friendship.find({ requester: req.userId, status: 'pending' }).populate(
      'recipient',
      'username displayName avatarUrl',
    );
    res.json({
      incoming: incoming.map((f) => ({
        id: f._id.toString(),
        user: f.requester && {
          id: f.requester._id.toString(),
          username: f.requester.username,
          displayName: f.requester.displayName || f.requester.username,
          avatarUrl: f.requester.avatarUrl,
        },
        createdAt: f.createdAt,
      })),
      outgoing: outgoing.map((f) => ({
        id: f._id.toString(),
        user: f.recipient && {
          id: f.recipient._id.toString(),
          username: f.recipient.username,
          displayName: f.recipient.displayName || f.recipient.username,
          avatarUrl: f.recipient.avatarUrl,
        },
        createdAt: f.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/request/:userId', authRequired, async (req, res, next) => {
  try {
    if (req.params.userId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot friend yourself' });
    }
    const peer = await User.findById(req.params.userId);
    if (!peer) return res.status(404).json({ error: 'User not found' });

    const existing = await Friendship.findOne({
      $or: [
        { requester: req.userId, recipient: peer._id },
        { requester: peer._id, recipient: req.userId },
      ],
    });
    if (existing) {
      if (existing.status === 'pending' && existing.recipient.equals(req.userId)) {
        existing.status = 'accepted';
        await existing.save();
        const notif = await Notification.create({
          user: existing.requester,
          actor: req.userId,
          type: 'friend_accept',
          entity: existing._id,
          entityModel: 'Friendship',
        });
        emitToUser(existing.requester.toString(), 'notification:new', notif);
        return res.json({ friendship: existing });
      }
      return res.status(409).json({ error: 'Already exists', friendship: existing });
    }
    const friendship = await Friendship.create({
      requester: req.userId,
      recipient: peer._id,
      status: 'pending',
    });
    const notif = await Notification.create({
      user: peer._id,
      actor: req.userId,
      type: 'friend_request',
      entity: friendship._id,
      entityModel: 'Friendship',
    });
    emitToUser(peer._id.toString(), 'notification:new', notif);
    res.status(201).json({ friendship });
  } catch (err) {
    next(err);
  }
});

router.post('/accept/:requestId', authRequired, async (req, res, next) => {
  try {
    const f = await Friendship.findById(req.params.requestId);
    if (!f || !f.recipient.equals(req.userId)) return res.status(404).json({ error: 'Not found' });
    if (f.status !== 'pending') return res.status(400).json({ error: 'Not pending' });
    f.status = 'accepted';
    await f.save();
    const notif = await Notification.create({
      user: f.requester,
      actor: req.userId,
      type: 'friend_accept',
      entity: f._id,
      entityModel: 'Friendship',
    });
    emitToUser(f.requester.toString(), 'notification:new', notif);
    res.json({ friendship: f });
  } catch (err) {
    next(err);
  }
});

router.post('/decline/:requestId', authRequired, async (req, res, next) => {
  try {
    const f = await Friendship.findById(req.params.requestId);
    if (!f || !f.recipient.equals(req.userId)) return res.status(404).json({ error: 'Not found' });
    if (f.status !== 'pending') return res.status(400).json({ error: 'Not pending' });
    await f.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:userId', authRequired, async (req, res, next) => {
  try {
    const f = await Friendship.findOne({
      $or: [
        { requester: req.userId, recipient: req.params.userId },
        { requester: req.params.userId, recipient: req.userId },
      ],
    });
    if (!f) return res.status(404).json({ error: 'Not found' });
    await f.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
