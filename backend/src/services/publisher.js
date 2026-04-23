const { getDb } = require('../db');
const { publishFacebookPost } = require('./facebook');
const { publishTikTokPost } = require('./tiktok');

async function publishToSocial(post, userId) {
  const db = getDb();
  const results = { success: [], failed: [] };

  const platforms = post.platform === 'both'
    ? ['facebook', 'tiktok']
    : [post.platform];

  for (const platform of platforms) {
    const connection = db.prepare(
      'SELECT * FROM platform_connections WHERE user_id = ? AND platform = ? AND is_connected = 1'
    ).get(userId, platform);

    if (!connection) {
      results.failed.push({ platform, error: `${platform} not connected` });
      continue;
    }

    try {
      let result;

      if (platform === 'facebook') {
        if (!connection.page_id) {
          throw new Error('No Facebook Page connected. Please select a page in Settings.');
        }
        result = await publishFacebookPost(post, connection.access_token, connection.page_id);
        db.prepare(`
          UPDATE posts SET facebook_post_id = ?, status = 'published', published_at = CURRENT_TIMESTAMP, error_message = NULL
          WHERE id = ?
        `).run(result.id, post.id);
      } else if (platform === 'tiktok') {
        result = await publishTikTokPost(post, connection.access_token);
        db.prepare(`
          UPDATE posts SET tiktok_post_id = ?, status = 'published', published_at = CURRENT_TIMESTAMP, error_message = NULL
          WHERE id = ?
        `).run(result.id, post.id);
      }

      results.success.push({ platform, id: result.id });
    } catch (err) {
      results.failed.push({ platform, error: err.message });
      db.prepare(`
        UPDATE posts SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(err.message, post.id);
    }
  }

  // Update final status
  if (results.success.length > 0 && results.failed.length === 0) {
    db.prepare("UPDATE posts SET status = 'published', published_at = CURRENT_TIMESTAMP WHERE id = ?").run(post.id);
  } else if (results.failed.length > 0 && results.success.length === 0) {
    db.prepare("UPDATE posts SET status = 'failed' WHERE id = ?").run(post.id);
  }

  return { results, post: db.prepare('SELECT * FROM posts WHERE id = ?').get(post.id) };
}

module.exports = { publishToSocial };
