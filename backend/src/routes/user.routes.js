const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/search', authRequired, [query('q').isString().notEmpty()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid query' });
    const q = String(req.query.q).trim().toLowerCase();
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
      ],
    })
      .limit(25)
      .lean();
    res.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        displayName: u.displayName || u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:idOrUsername', authRequired, async (req, res, next) => {
  try {
    const { idOrUsername } = req.params;
    const user = await (idOrUsername.match(/^[a-f0-9]{24}$/i)
      ? User.findById(idOrUsername)
      : User.findOne({ username: idOrUsername.toLowerCase() }));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const friendship = await Friendship.findOne({
      $or: [
        { requester: req.userId, recipient: user._id },
        { requester: user._id, recipient: req.userId },
      ],
    });
    res.json({
      user: user.toPublicJSON(),
      friendship: friendship
        ? {
            status: friendship.status,
            isRequester: friendship.requester.equals(req.userId),
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/me',
  authRequired,
  [
    body('displayName').optional().isString().isLength({ max: 64 }),
    body('bio').optional().isString().isLength({ max: 280 }),
    body('avatarUrl').optional().isString(),
    body('coverUrl').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed' });
      
      const updateFields = {};
      const fields = ['displayName', 'bio', 'avatarUrl', 'coverUrl'];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) updateFields[f] = req.body[f];
      });
      
      if (Object.keys(updateFields).length === 0) {
        return res.json({ user: req.user.toPrivateJSON() });
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $set: updateFields },
        { new: true }
      );
      
      res.json({ user: updatedUser.toPrivateJSON() });
    } catch (err) {
      next(err);
    }
  },
);

router.patch('/me/settings', authRequired, async (req, res, next) => {
  try {
    const { language, theme, notifications } = req.body || {};
    const updateFields = {};
    
    if (language && ['ru', 'ro', 'en'].includes(language)) {
      updateFields['settings.language'] = language;
    }
    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      updateFields['settings.theme'] = theme;
    }
    if (notifications && typeof notifications === 'object') {
      for (const [key, value] of Object.entries(notifications)) {
        if (['messages', 'likes', 'friendRequests'].includes(key)) {
          updateFields[`settings.notifications.${key}`] = Boolean(value);
        }
      }
    }
    
    if (Object.keys(updateFields).length === 0) {
      return res.json({ settings: req.user.settings });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    );
    
    res.json({ settings: updatedUser.settings });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/me/password',
  authRequired,
  [body('currentPassword').isString(), body('newPassword').isString().isLength({ min: 6 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed' });
      const ok = await req.user.verifyPassword(req.body.currentPassword);
      if (!ok) return res.status(401).json({ error: 'Wrong current password' });
      await req.user.setPassword(req.body.newPassword);
      await req.user.save();
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
