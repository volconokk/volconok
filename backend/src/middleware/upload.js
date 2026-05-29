const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  // Accept common image MIME types. Mobile clients sometimes send non-standard
  // variants like 'image/jpg' or generic 'application/octet-stream' for images.
  const allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ];
  const ext = (file.originalname || '').split('.').pop()?.toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];

  if (allowed.includes(file.mimetype) || imageExtensions.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Unsupported file type'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 6 },
});

function publicUrlFor(filename) {
  const base = process.env.PUBLIC_URL || '';
  return `${base.replace(/\/$/, '')}/uploads/${filename}`;
}

module.exports = { upload, publicUrlFor };
