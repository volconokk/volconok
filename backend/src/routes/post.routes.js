const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Friendship = require('../models/Friendship');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { emitToUser } = require('../realtime/socket');

const router = express.Router();

function serializePost(post, currentUserId) {
  const reactions = post.reactions || [];
  const my = reactions.find((r) => r.user.toString() === currentUserId.toString());
  const counts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  return {
    id: post._id.toString(),
    text: post.text,
    images: post.images,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    commentsCount: post.commentsCount,
    likesCount: reactions.length,
    reactionCounts: counts,
    myReaction: my ? my.type : null,
    author: post.author
      ? {
          id: post.author._id?.toString?.() || post.author.toString(),
          username: post.author.username,
          displayName: post.author.displayName || post.author.username,
          avatarUrl: post.author.avatarUrl,
        }
      : null,
  };
}

router.get('/feed', authRequired, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const cursor = req.query.cursor;

    const friends = await Friendship.find({
      status: 'accepted',
      $or: [{ requester: req.userId }, { recipient: req.userId }],
    }).lean();
    const friendIds = friends.map((f) =>
      f.requester.toString() === req.userId.toString() ? f.recipient : f.requester,
    );
    const authorIds = [req.userId, ...friendIds];

    const filter = { author: { $in: authorIds } };
    if (cursor) filter._id = { $lt: cursor };

    const posts = await Post.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('author', 'username displayName avatarUrl');

    const hasMore = posts.length > limit;
    const slice = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? slice[slice.length - 1]._id.toString() : null;

    res.json({
      posts: slice.map((p) => serializePost(p, req.userId)),
      nextCursor,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/user/:userId', authRequired, async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ _id: -1 })
      .limit(50)
      .populate('author', 'username displayName avatarUrl');
    res.json({ posts: posts.map((p) => serializePost(p, req.userId)) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'username displayName avatarUrl',
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post: serializePost(post, req.userId) });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authRequired,
  [
    body('text').optional().isString().isLength({ max: 2000 }),
    body('images').optional().isArray({ max: 6 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed' });
      const { text = '', images = [] } = req.body;
      if (!text.trim() && images.length === 0) {
        return res.status(400).json({ error: 'Post must have text or images' });
      }
      const post = await Post.create({ author: req.userId, text: text.trim(), images });
      const populated = await post.populate('author', 'username displayName avatarUrl');
      res.status(201).json({ post: serializePost(populated, req.userId) });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.author.equals(req.userId)) return res.status(403).json({ error: 'Forbidden' });
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/react', authRequired, async (req, res, next) => {
  try {
    const { type = 'like' } = req.body || {};
    if (!Post.REACTIONS.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existingIdx = post.reactions.findIndex((r) =>
      r.user.toString() === req.userId.toString(),
    );
    let action = 'added';
    if (existingIdx >= 0) {
      if (post.reactions[existingIdx].type === type) {
        post.reactions.splice(existingIdx, 1);
        action = 'removed';
      } else {
        post.reactions[existingIdx].type = type;
        action = 'changed';
      }
    } else {
      post.reactions.push({ user: req.userId, type });
    }
    await post.save();

    if (action !== 'removed' && !post.author.equals(req.userId)) {
      const notif = await Notification.create({
        user: post.author,
        actor: req.userId,
        type: 'like',
        entity: post._id,
        entityModel: 'Post',
      });
      emitToUser(post.author.toString(), 'notification:new', notif);
    }

    const populated = await post.populate('author', 'username displayName avatarUrl');
    res.json({ post: serializePost(populated, req.userId), action });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
