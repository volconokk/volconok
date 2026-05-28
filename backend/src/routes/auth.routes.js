const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return true;
  }
  return false;
}

router.post(
  '/register',
  [
    body('username').isString().trim().isLength({ min: 3, max: 32 }),
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6, max: 128 }),
    body('displayName').optional().isString().isLength({ max: 64 }),
  ],
  async (req, res, next) => {
    try {
      if (handleValidation(req, res)) return;
      const { username, email, password, displayName } = req.body;
      const exists = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
      });
      if (exists) return res.status(409).json({ error: 'User already exists' });

      const user = new User({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        displayName: displayName || username,
      });
      await user.setPassword(password);
      await user.save();

      const token = signToken(user._id);
      res.status(201).json({ token, user: user.toPrivateJSON() });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/login',
  [body('login').isString(), body('password').isString()],
  async (req, res, next) => {
    try {
      if (handleValidation(req, res)) return;
      const { login, password } = req.body;
      const user = await User.findOne({
        $or: [{ username: login.toLowerCase() }, { email: login.toLowerCase() }],
      });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await user.verifyPassword(password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = signToken(user._id);
      res.json({ token, user: user.toPrivateJSON() });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/me', authRequired, async (req, res) => {
  res.json({ user: req.user.toPrivateJSON() });
});

module.exports = router;
