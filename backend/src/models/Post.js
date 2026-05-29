const mongoose = require('mongoose');

const REACTIONS = ['like', 'love', 'haha', 'wow', 'sad', 'pencil'];

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: REACTIONS, default: 'like' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, maxlength: 2000, default: '' },
    images: [{ type: String }],
    reactions: [reactionSchema],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

postSchema.index({ author: 1, _id: -1 });

postSchema.virtual('likesCount').get(function likesCount() {
  return this.reactions.length;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

postSchema.statics.REACTIONS = REACTIONS;

module.exports = mongoose.model('Post', postSchema);
