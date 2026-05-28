require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Friendship = require('../models/Friendship');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volconok');
  console.log('Connected to mongo, seeding...');

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Friendship.deleteMany({}),
  ]);

  const users = [];
  const sample = [
    { username: 'anna', displayName: 'Анна', bio: 'Люблю рисовать карандашом' },
    { username: 'mihai', displayName: 'Mihai', bio: 'Bună ziua! Din Chișinău' },
    { username: 'leo', displayName: 'Leo', bio: 'Hello from London' },
    { username: 'sasha', displayName: 'Саша', bio: 'Гитара, кофе, код' },
  ];
  for (const s of sample) {
    const u = new User({
      username: s.username,
      email: `${s.username}@volconok.local`,
      displayName: s.displayName,
      bio: s.bio,
    });
    await u.setPassword('volconok');
    await u.save();
    users.push(u);
  }

  for (let i = 1; i < users.length; i += 1) {
    await Friendship.create({
      requester: users[0]._id,
      recipient: users[i]._id,
      status: 'accepted',
    });
  }

  const samplePosts = [
    'Первый пост в Volconok! ✏️',
    'Salut! Acesta este al doilea post.',
    'Pencil sketch vibes today.',
    'Кто хочет на прогулку?',
  ];
  for (let i = 0; i < samplePosts.length; i += 1) {
    await Post.create({ author: users[i % users.length]._id, text: samplePosts[i] });
  }

  console.log('Done. Try logging in with username "anna" and password "volconok".');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
