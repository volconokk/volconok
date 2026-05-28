const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['like', 'comment', 'message', 'friend_request', 'friend_accept'],
      required: true,
    },
    entity: { type: mongoose.Schema.Types.ObjectId },
    entityModel: { type: String, enum: ['Post', 'Comment', 'Message', 'Friendship'] },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Notification', notificationSchema);
