const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for media uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
    cb(new Error('Only images and videos are allowed'));
  }
});

// Get all posts for user
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { status, platform, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = 'SELECT * FROM posts WHERE user_id = ?';
  const params = [req.user.id];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (platform) {
    query += ' AND (platform = ? OR platform = "both")';
    params.push(platform);
  }

  query += ' ORDER BY scheduled_at ASC, created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const posts = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(req.user.id).count;

  // Parse tags JSON
  const parsedPosts = posts.map(p => ({
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : []
  }));

  res.json({ posts: parsedPosts, total, page: parseInt(page), limit: parseInt(limit) });
});

// Get upcoming scheduled posts
router.get('/upcoming', authMiddleware, (req, res) => {
  const db = getDb();
  const posts = db.prepare(`
    SELECT * FROM posts
    WHERE user_id = ? AND status = 'scheduled' AND scheduled_at > datetime('now')
    ORDER BY scheduled_at ASC
    LIMIT 10
  `).all(req.user.id);

  const parsedPosts = posts.map(p => ({
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : []
  }));

  res.json({ posts: parsedPosts });
});

// Get dashboard stats
router.get('/stats', authMiddleware, (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  const total = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(userId).count;
  const scheduled = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'scheduled'").get(userId).count;
  const published = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'published'").get(userId).count;
  const draft = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'draft'").get(userId).count;
  const failed = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'failed'").get(userId).count;
  const facebook = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND (platform = 'facebook' OR platform = 'both')").get(userId).count;
  const tiktok = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND (platform = 'tiktok' OR platform = 'both')").get(userId).count;

  // Recent activity (last 7 days)
  const recentActivity = db.prepare(`
    SELECT date(scheduled_at) as date, COUNT(*) as count
    FROM posts
    WHERE user_id = ? AND scheduled_at >= date('now', '-7 days')
    GROUP BY date(scheduled_at)
    ORDER BY date ASC
  `).all(userId);

  res.json({
    total, scheduled, published, draft, failed, facebook, tiktok, recentActivity
  });
});

// Get calendar posts
router.get('/calendar', authMiddleware, (req, res) => {
  const db = getDb();
  const { month, year } = req.query;

  let query = `
    SELECT id, title, platform, status, scheduled_at, media_type
    FROM posts
    WHERE user_id = ? AND scheduled_at IS NOT NULL
  `;
  const params = [req.user.id];

  if (month && year) {
    query += ` AND strftime('%m', scheduled_at) = ? AND strftime('%Y', scheduled_at) = ?`;
    params.push(month.padStart(2, '0'), year);
  }

  query += ' ORDER BY scheduled_at ASC';

  const posts = db.prepare(query).all(...params);
  res.json({ posts });
});

// Get single post
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  res.json({
    ...post,
    tags: post.tags ? JSON.parse(post.tags) : []
  });
});

// Create post
router.post('/', authMiddleware, upload.single('media'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('platform').isIn(['facebook', 'tiktok', 'both']).withMessage('Invalid platform'),
  body('status').optional().isIn(['draft', 'scheduled']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, caption, platform, status = 'draft', scheduled_at, media_url, tags } = req.body;
  const db = getDb();
  const id = uuidv4();

  let mediaPath = null;
  let mediaType = null;

  if (req.file) {
    mediaPath = req.file.filename;
    const ext = path.extname(req.file.originalname).toLowerCase();
    mediaType = ['.mp4', '.mov', '.avi', '.webm'].includes(ext) ? 'video' : 'image';
  } else if (media_url) {
    mediaType = 'image'; // assume image for URLs
  }

  // Validate scheduled_at if status is 'scheduled'
  if (status === 'scheduled' && !scheduled_at) {
    return res.status(400).json({ error: 'scheduled_at is required for scheduled posts' });
  }

  const tagsJson = tags ? JSON.stringify(Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : null;

  db.prepare(`
    INSERT INTO posts (id, user_id, title, caption, media_url, media_type, media_path, platform, status, scheduled_at, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, title, caption || null, media_url || null, mediaType, mediaPath, platform, status, scheduled_at || null, tagsJson);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  res.status(201).json({
    ...post,
    tags: post.tags ? JSON.parse(post.tags) : []
  });
});

// Update post
router.put('/:id', authMiddleware, upload.single('media'), (req, res) => {
  const db = getDb();
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.status === 'published') {
    return res.status(400).json({ error: 'Cannot edit a published post' });
  }

  const { title, caption, platform, status, scheduled_at, media_url, tags } = req.body;

  let mediaPath = post.media_path;
  let mediaType = post.media_type;
  let mediaUrlFinal = post.media_url;

  if (req.file) {
    // Delete old file if exists
    if (post.media_path) {
      const oldPath = path.join(uploadDir, post.media_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    mediaPath = req.file.filename;
    const ext = path.extname(req.file.originalname).toLowerCase();
    mediaType = ['.mp4', '.mov', '.avi', '.webm'].includes(ext) ? 'video' : 'image';
    mediaUrlFinal = null;
  } else if (media_url !== undefined) {
    mediaUrlFinal = media_url;
  }

  const tagsJson = tags
    ? JSON.stringify(Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()))
    : post.tags;

  db.prepare(`
    UPDATE posts SET
      title = ?, caption = ?, media_url = ?, media_type = ?, media_path = ?,
      platform = ?, status = ?, scheduled_at = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(
    title || post.title,
    caption !== undefined ? caption : post.caption,
    mediaUrlFinal,
    mediaType,
    mediaPath,
    platform || post.platform,
    status || post.status,
    scheduled_at !== undefined ? scheduled_at : post.scheduled_at,
    tagsJson,
    req.params.id,
    req.user.id
  );

  const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  res.json({
    ...updated,
    tags: updated.tags ? JSON.parse(updated.tags) : []
  });
});

// Delete post
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  // Delete media file if exists
  if (post.media_path) {
    const filePath = path.join(uploadDir, post.media_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Post deleted successfully' });
});

// Publish post now (manual publish)
router.post('/:id/publish', authMiddleware, async (req, res) => {
  const db = getDb();
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.status === 'published') {
    return res.status(400).json({ error: 'Post already published' });
  }

  const { publishToSocial } = require('../services/publisher');

  try {
    const result = await publishToSocial(post, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicate post
router.post('/:id/duplicate', authMiddleware, (req, res) => {
  const db = getDb();
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  const newId = uuidv4();
  db.prepare(`
    INSERT INTO posts (id, user_id, title, caption, media_url, media_type, platform, status, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)
  `).run(newId, req.user.id, `${post.title} (Copy)`, post.caption, post.media_url, post.media_type, post.platform, post.tags);

  const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(newId);
  res.status(201).json({
    ...newPost,
    tags: newPost.tags ? JSON.parse(newPost.tags) : []
  });
});

module.exports = router;
