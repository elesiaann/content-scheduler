const cron = require('node-cron');
const { getDb } = require('../db');
const { publishToSocial } = require('./publisher');

let schedulerTask = null;

function startScheduler() {
  // Run every minute to check for posts to publish
  schedulerTask = cron.schedule('* * * * *', async () => {
    const db = getDb();

    const duePosts = db.prepare(`
      SELECT * FROM posts
      WHERE status = 'scheduled'
        AND scheduled_at <= datetime('now', '+1 minute')
        AND scheduled_at >= datetime('now', '-5 minutes')
    `).all();

    if (duePosts.length === 0) return;

    console.log(`[Scheduler] Processing ${duePosts.length} due post(s)`);

    for (const post of duePosts) {
      console.log(`[Scheduler] Publishing post: ${post.id} (${post.title})`);
      try {
        await publishToSocial(post, post.user_id);
        console.log(`[Scheduler] Successfully published post: ${post.id}`);
      } catch (err) {
        console.error(`[Scheduler] Failed to publish post ${post.id}:`, err.message);
        db.prepare(`
          UPDATE posts SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(err.message, post.id);
      }
    }
  });

  console.log('[Scheduler] Started - checking every minute for scheduled posts');
}

function stopScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    console.log('[Scheduler] Stopped');
  }
}

module.exports = { startScheduler, stopScheduler };
