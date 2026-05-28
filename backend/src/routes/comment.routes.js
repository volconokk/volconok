const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { emitToUser } = require('../realtime/socket');

const router = express.Router();

router.get('/post/:postId', authRequired, async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'username displayName avatarUrl');
    res.json({
      comments: comments.map((c) => ({
        id: c._id.toString(),
        text: c.text,
        createdAt: c.createdAt,
        likes: c.likes.length,
        liked: c.likes.some((u) => u.toString() === req.userId.toString()),
        author: c.author && {
          id: c.author._id.toString(),
          username: c.author.username,
          displayName: c.author.displayName || c.author.username,
          avatarUrl: c.author.avatarUrl,
        },
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/post/:postId',
  authRequired,
  [body('text').isString().isLength({ min: 1, max: 1000 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed' });
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      const comment = await Comment.create({
        post: post._id,
        author: req.userId,
        text: req.body.text.trim(),
      });
      post.commentsCount += 1;
      await post.save();

      const populated = await comment.populate('author', 'username displayName avatarUrl');
      if (!post.author.equals(req.userId)) {
        const notif = await Notification.create({
          user: post.author,
          actor: req.userId,
          type: 'comment',
          entity: post._id,
          entityModel: 'Post',
        });
        emitToUser(post.author.toString(), 'notification:new', notif);
      }
      res.status(201).json({
        comment: {
          id: populated._id.toString(),
          text: populated.text,
          createdAt: populated.createdAt,
          likes: 0,
          liked: false,
          author: {
            id: populated.author._id.toString(),
            username: populated.author.username,
            displayName: populated.author.displayName || populated.author.username,
            avatarUrl: populated.author.avatarUrl,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    const post = await Post.findById(comment.post);
    const owner = comment.author.equals(req.userId) || (post && post.author.equals(req.userId));
    if (!owner) return res.status(403).json({ error: 'Forbidden' });
    await comment.deleteOne();
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/like', authRequired, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    const idx = comment.likes.findIndex((u) => u.toString() === req.userId.toString());
    if (idx >= 0) comment.likes.splice(idx, 1);
    else comment.likes.push(req.userId);
    await comment.save();
    res.json({ likes: comment.likes.length, liked: idx < 0 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
