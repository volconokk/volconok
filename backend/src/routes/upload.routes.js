const express = require('express');
const { authRequired } = require('../middleware/auth');
const { upload, publicUrlFor } = require('../middleware/upload');

const router = express.Router();

router.post('/image', authRequired, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.status(201).json({ url: publicUrlFor(req.file.filename) });
});

router.post('/images', authRequired, upload.array('files', 6), (req, res) => {
  const files = (req.files || []).map((f) => publicUrlFor(f.filename));
  res.status(201).json({ urls: files });
});

module.exports = router;
