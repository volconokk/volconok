const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const settingsSchema = new mongoose.Schema(
  {
    language: { type: String, enum: ['ru', 'ro', 'en'], default: 'ru' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: {
      messages: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true },
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
      lowercase: true,
      match: /^[a-z0-9_.]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true, maxlength: 64, default: '' },
    bio: { type: String, maxlength: 280, default: '' },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    settings: { type: settingsSchema, default: () => ({}) },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    username: this.username,
    displayName: this.displayName || this.username,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    coverUrl: this.coverUrl,
    createdAt: this.createdAt,
    lastSeenAt: this.lastSeenAt,
  };
};

userSchema.methods.toPrivateJSON = function toPrivateJSON() {
  return {
    ...this.toPublicJSON(),
    email: this.email,
    settings: this.settings,
  };
};

module.exports = mongoose.model('User', userSchema);
