const express = require('express');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actor', 'username displayName avatarUrl')
      .lean();
    res.json({
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        read: n.read,
        createdAt: n.createdAt,
        entity: n.entity,
        entityModel: n.entityModel,
        actor: n.actor && {
          id: n.actor._id.toString(),
          username: n.actor.username,
          displayName: n.actor.displayName || n.actor.username,
          avatarUrl: n.actor.avatarUrl,
        },
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/unread-count', authRequired, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.userId, read: false });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', authRequired, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/read', authRequired, async (req, res, next) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, user: req.userId },
      { $set: { read: true } },
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
