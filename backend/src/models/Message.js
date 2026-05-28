const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '', maxlength: 4000 },
    attachment: { type: String, default: '' },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

messageSchema.index({ from: 1, to: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
