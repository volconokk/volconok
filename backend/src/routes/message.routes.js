const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { emitToUser } = require('../realtime/socket');

const router = express.Router();

router.get('/threads', authRequired, async (req, res, next) => {
  try {
    const me = new mongoose.Types.ObjectId(req.userId);
    const threads = await Message.aggregate([
      { $match: { $or: [{ from: me }, { to: me }] } },
      {
        $project: {
          text: 1,
          attachment: 1,
          createdAt: 1,
          readAt: 1,
          from: 1,
          to: 1,
          peer: {
            $cond: [{ $eq: ['$from', me] }, '$to', '$from'],
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$peer',
          lastMessage: { $first: '$$ROOT' },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$to', me] }, { $eq: ['$readAt', null] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    const peerIds = threads.map((t) => t._id);
    const users = await User.find({ _id: { $in: peerIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    res.json({
      threads: threads.map((t) => {
        const u = userMap.get(t._id.toString());
        return {
          peer: u && {
            id: u._id.toString(),
            username: u.username,
            displayName: u.displayName || u.username,
            avatarUrl: u.avatarUrl,
            lastSeenAt: u.lastSeenAt,
          },
          unread: t.unread,
          lastMessage: {
            id: t.lastMessage._id.toString(),
            text: t.lastMessage.text,
            attachment: t.lastMessage.attachment,
            createdAt: t.lastMessage.createdAt,
            outgoing: t.lastMessage.from.toString() === req.userId.toString(),
            readAt: t.lastMessage.readAt,
          },
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/unread-count', authRequired, async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ to: req.userId, readAt: null });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

router.get('/with/:userId', authRequired, async (req, res, next) => {
  try {
    const peerId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { from: req.userId, to: peerId },
        { from: peerId, to: req.userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    await Message.updateMany(
      { from: peerId, to: req.userId, readAt: null },
      { $set: { readAt: new Date() } },
    );

    res.json({
      messages: messages.map((m) => ({
        id: m._id.toString(),
        text: m.text,
        attachment: m.attachment,
        createdAt: m.createdAt,
        readAt: m.readAt,
        from: m.from.toString(),
        to: m.to.toString(),
        outgoing: m.from.toString() === req.userId.toString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/with/:userId',
  authRequired,
  [
    body('text').optional().isString().isLength({ max: 4000 }),
    body('attachment').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed' });
      const { text = '', attachment = '' } = req.body;
      if (!text.trim() && !attachment) {
        return res.status(400).json({ error: 'Message must have text or attachment' });
      }
      const peerId = req.params.userId;
      const peer = await User.findById(peerId);
      if (!peer) return res.status(404).json({ error: 'User not found' });

      const message = await Message.create({
        from: req.userId,
        to: peerId,
        text: text.trim(),
        attachment,
      });

      const payload = {
        id: message._id.toString(),
        text: message.text,
        attachment: message.attachment,
        createdAt: message.createdAt,
        readAt: null,
        from: req.userId.toString(),
        to: peerId,
      };

      emitToUser(peerId, 'message:new', { ...payload, outgoing: false });
      emitToUser(req.userId.toString(), 'message:new', { ...payload, outgoing: true });

      const notif = await Notification.create({
        user: peerId,
        actor: req.userId,
        type: 'message',
        entity: message._id,
        entityModel: 'Message',
      });
      emitToUser(peerId, 'notification:new', notif);

      res.status(201).json({ message: { ...payload, outgoing: true } });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/with/:userId/read', authRequired, async (req, res, next) => {
  try {
    await Message.updateMany(
      { from: req.params.userId, to: req.userId, readAt: null },
      { $set: { readAt: new Date() } },
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
