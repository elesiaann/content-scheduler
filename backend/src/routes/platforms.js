const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all platform connections for user
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const connections = db.prepare(
    'SELECT id, platform, page_name, page_id, is_connected, expires_at, created_at FROM platform_connections WHERE user_id = ?'
  ).all(req.user.id);

  res.json({ connections });
});

// Connect Facebook
router.post('/facebook/connect', authMiddleware, (req, res) => {
  const { access_token, page_id, page_name } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'access_token is required' });
  }

  const db = getDb();
  const id = uuidv4();

  const existing = db.prepare(
    'SELECT id FROM platform_connections WHERE user_id = ? AND platform = ?'
  ).get(req.user.id, 'facebook');

  if (existing) {
    db.prepare(`
      UPDATE platform_connections SET
        access_token = ?, page_id = ?, page_name = ?, is_connected = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND platform = ?
    `).run(access_token, page_id || null, page_name || null, req.user.id, 'facebook');
  } else {
    db.prepare(`
      INSERT INTO platform_connections (id, user_id, platform, access_token, page_id, page_name, is_connected)
      VALUES (?, ?, 'facebook', ?, ?, ?, 1)
    `).run(id, req.user.id, access_token, page_id || null, page_name || null);
  }

  res.json({ message: 'Facebook connected successfully', platform: 'facebook', page_name });
});

// Connect TikTok
router.post('/tiktok/connect', authMiddleware, (req, res) => {
  const { access_token, refresh_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'access_token is required' });
  }

  const db = getDb();
  const id = uuidv4();

  const existing = db.prepare(
    'SELECT id FROM platform_connections WHERE user_id = ? AND platform = ?'
  ).get(req.user.id, 'tiktok');

  if (existing) {
    db.prepare(`
      UPDATE platform_connections SET
        access_token = ?, refresh_token = ?, is_connected = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND platform = ?
    `).run(access_token, refresh_token || null, req.user.id, 'tiktok');
  } else {
    db.prepare(`
      INSERT INTO platform_connections (id, user_id, platform, access_token, refresh_token, is_connected)
      VALUES (?, ?, 'tiktok', ?, ?, 1)
    `).run(id, req.user.id, access_token, refresh_token || null);
  }

  res.json({ message: 'TikTok connected successfully', platform: 'tiktok' });
});

// Disconnect platform
router.delete('/:platform', authMiddleware, (req, res) => {
  const { platform } = req.params;

  if (!['facebook', 'tiktok'].includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform' });
  }

  const db = getDb();
  db.prepare(
    'UPDATE platform_connections SET is_connected = 0, access_token = NULL, refresh_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND platform = ?'
  ).run(req.user.id, platform);

  res.json({ message: `${platform} disconnected successfully` });
});

// Get Facebook OAuth URL
router.get('/facebook/oauth-url', authMiddleware, (req, res) => {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/facebook/callback`;
  const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list,publish_to_groups';

  if (!appId) {
    return res.status(400).json({ error: 'Facebook App ID not configured' });
  }

  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
  res.json({ url });
});

// Handle Facebook OAuth callback
router.post('/facebook/callback', authMiddleware, async (req, res) => {
  const { code } = req.body;
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/facebook/callback`;

  if (!appId || !appSecret) {
    return res.status(400).json({ error: 'Facebook credentials not configured' });
  }

  try {
    const axios = require('axios');

    // Exchange code for token
    const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: { client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code }
    });

    const { access_token } = tokenRes.data;

    // Get user's pages
    const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: { access_token }
    });

    const pages = pagesRes.data.data || [];
    res.json({ access_token, pages });
  } catch (err) {
    console.error('Facebook OAuth error:', err.response?.data || err.message);
    res.status(400).json({ error: 'Failed to authenticate with Facebook' });
  }
});

// Get TikTok OAuth URL
router.get('/tiktok/oauth-url', authMiddleware, (req, res) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/tiktok/callback`;

  if (!clientKey) {
    return res.status(400).json({ error: 'TikTok Client Key not configured' });
  }

  const csrfState = Math.random().toString(36).substring(2);
  const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${csrfState}`;
  res.json({ url });
});

// Handle TikTok OAuth callback
router.post('/tiktok/callback', authMiddleware, async (req, res) => {
  const { code } = req.body;
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/tiktok/callback`;

  if (!clientKey || !clientSecret) {
    return res.status(400).json({ error: 'TikTok credentials not configured' });
  }

  try {
    const axios = require('axios');

    const tokenRes = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, open_id } = tokenRes.data;
    res.json({ access_token, refresh_token, open_id });
  } catch (err) {
    console.error('TikTok OAuth error:', err.response?.data || err.message);
    res.status(400).json({ error: 'Failed to authenticate with TikTok' });
  }
});

module.exports = router;
