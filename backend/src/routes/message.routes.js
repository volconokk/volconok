const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { emitToUser } = require('../realtime/socket');

const router = express.Router();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Serialize a message, optionally embedding a reply-to preview.
function serializeMessage(m, currentUserId, replyMap) {
  const id = m._id ? m._id.toString() : m.id;
  let replyPreview = null;
  if (m.replyTo) {
    const replyId = m.replyTo.toString();
    const r = replyMap?.get(replyId);
    if (r) {
      replyPreview = {
        id: replyId,
        text: r.deletedAt ? '' : r.text,
        deleted: !!r.deletedAt,
        outgoing: r.from.toString() === currentUserId.toString(),
      };
    }
  }
  return {
    id,
    text: m.deletedAt ? '' : m.text,
    attachment: m.deletedAt ? '' : m.attachment,
    deleted: !!m.deletedAt,
    edited: !!m.editedAt,
    replyTo: replyPreview,
    reactions: (m.reactions || []).map((r) => ({
      user: r.user.toString(),
      type: r.type,
    })),
    createdAt: m.createdAt,
    readAt: m.readAt,
    from: m.from.toString(),
    to: m.to.toString(),
    outgoing: m.from.toString() === currentUserId.toString(),
  };
}

router.get('/threads', authRequired, async (req, res, next) => {
  try {
    const me = new mongoose.Types.ObjectId(req.userId);
    const threads = await Message.aggregate([
      { $match: { $or: [{ from: me }, { to: me }] } },
      {
        $project: {
          text: 1,
          attachment: 1,
          deletedAt: 1,
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
            text: t.lastMessage.deletedAt ? '' : t.lastMessage.text,
            deleted: !!t.lastMessage.deletedAt,
            attachment: t.lastMessage.deletedAt ? '' : t.lastMessage.attachment,
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
    if (!isValidId(peerId)) return res.status(400).json({ error: 'Invalid user id' });

    // Mark incoming as read FIRST so the returned data is fresh.
    await Message.updateMany(
      { from: peerId, to: req.userId, readAt: null },
      { $set: { readAt: new Date() } },
    );

    const messages = await Message.find({
      $or: [
        { from: req.userId, to: peerId },
        { from: peerId, to: req.userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    // Build reply-preview map for any referenced messages.
    const replyIds = messages.filter((m) => m.replyTo).map((m) => m.replyTo.toString());
    const replyMap = new Map(messages.map((m) => [m._id.toString(), m]));
    const missing = replyIds.filter((id) => !replyMap.has(id));
    if (missing.length) {
      const extra = await Message.find({ _id: { $in: missing } }).lean();
      extra.forEach((m) => replyMap.set(m._id.toString(), m));
    }

    // Tell the peer their sent messages were just read.
    emitToUser(peerId, 'message:read', { by: req.userId.toString() });

    res.json({
      messages: messages.map((m) => serializeMessage(m, req.userId, replyMap)),
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
    body('replyTo').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed' });
      const { text = '', attachment = '', replyTo } = req.body;
      if (!text.trim() && !attachment) {
        return res.status(400).json({ error: 'Message must have text or attachment' });
      }
      const peerId = req.params.userId;
      if (!isValidId(peerId)) return res.status(400).json({ error: 'Invalid user id' });
      const peer = await User.findById(peerId);
      if (!peer) return res.status(404).json({ error: 'User not found' });

      let replyToId = null;
      let replyMap = null;
      if (replyTo && isValidId(replyTo)) {
        const replied = await Message.findById(replyTo).lean();
        if (replied) {
          replyToId = replied._id;
          replyMap = new Map([[replied._id.toString(), replied]]);
        }
      }

      const message = await Message.create({
        from: req.userId,
        to: peerId,
        text: text.trim(),
        attachment,
        replyTo: replyToId,
      });

      const base = serializeMessage(message.toObject(), req.userId, replyMap);

      emitToUser(peerId, 'message:new', { ...base, outgoing: false });
      emitToUser(req.userId.toString(), 'message:new', { ...base, outgoing: true });

      // Respect the recipient's message notification setting.
      if (peer.settings?.notifications?.messages !== false) {
        const notif = await Notification.create({
          user: peerId,
          actor: req.userId,
          type: 'message',
          entity: message._id,
          entityModel: 'Message',
        });
        emitToUser(peerId, 'notification:new', notif);
      }

      res.status(201).json({ message: { ...base, outgoing: true } });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/with/:userId/read', authRequired, async (req, res, next) => {
  try {
    const peerId = req.params.userId;
    if (!isValidId(peerId)) return res.status(400).json({ error: 'Invalid user id' });
    await Message.updateMany(
      { from: peerId, to: req.userId, readAt: null },
      { $set: { readAt: new Date() } },
    );
    emitToUser(peerId, 'message:read', { by: req.userId.toString() });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Edit a message (author only).
router.patch(
  '/:id',
  authRequired,
  [body('text').isString().isLength({ min: 1, max: 4000 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed' });
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ error: 'Invalid id' });

      const message = await Message.findById(id);
      if (!message) return res.status(404).json({ error: 'Message not found' });
      if (!message.from.equals(req.userId)) {
        return res.status(403).json({ error: 'Not your message' });
      }
      if (message.deletedAt) return res.status(400).json({ error: 'Message deleted' });

      message.text = req.body.text.trim();
      message.editedAt = new Date();
      await message.save();

      const payload = {
        id: message._id.toString(),
        text: message.text,
        edited: true,
        from: message.from.toString(),
        to: message.to.toString(),
      };
      emitToUser(message.to.toString(), 'message:edited', payload);
      emitToUser(message.from.toString(), 'message:edited', payload);

      res.json({ message: payload });
    } catch (err) {
      next(err);
    }
  },
);

// Delete a message (author only, soft delete).
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid id' });

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (!message.from.equals(req.userId)) {
      return res.status(403).json({ error: 'Not your message' });
    }

    message.deletedAt = new Date();
    message.text = '';
    message.attachment = '';
    message.reactions = [];
    await message.save();

    const payload = {
      id: message._id.toString(),
      from: message.from.toString(),
      to: message.to.toString(),
    };
    emitToUser(message.to.toString(), 'message:deleted', payload);
    emitToUser(message.from.toString(), 'message:deleted', payload);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// React / unreact to a message.
router.post('/:id/react', authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'like' } = req.body || {};
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid id' });
    if (!Message.REACTIONS.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.deletedAt) return res.status(400).json({ error: 'Message deleted' });
    // Only participants can react.
    if (!message.from.equals(req.userId) && !message.to.equals(req.userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const idx = message.reactions.findIndex((r) => r.user.equals(req.userId));
    if (idx >= 0) {
      if (message.reactions[idx].type === type) {
        message.reactions.splice(idx, 1);
      } else {
        message.reactions[idx].type = type;
      }
    } else {
      message.reactions.push({ user: req.userId, type });
    }
    await message.save();

    const payload = {
      id: message._id.toString(),
      reactions: message.reactions.map((r) => ({ user: r.user.toString(), type: r.type })),
      from: message.from.toString(),
      to: message.to.toString(),
    };
    emitToUser(message.to.toString(), 'message:react', payload);
    emitToUser(message.from.toString(), 'message:react', payload);

    res.json({ message: payload });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
