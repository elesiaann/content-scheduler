const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TIKTOK_API = 'https://open.tiktokapis.com/v2';

async function publishTikTokPost(post, accessToken) {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');

    if (!post.media_path && !post.media_url) {
      throw new Error('TikTok requires a video file');
    }

    // Step 1: Initialize upload
    const initRes = await axios.post(`${TIKTOK_API}/post/publish/video/init/`, {
      post_info: {
        title: post.title,
        description: post.caption || post.title,
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        privacy_level: 'PUBLIC_TO_EVERYONE'
      },
      source_info: {
        source: post.media_url ? 'PULL_FROM_URL' : 'FILE_UPLOAD',
        ...(post.media_url ? { video_url: post.media_url } : {})
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });

    const { publish_id, upload_url, chunk_size } = initRes.data.data;

    // Step 2: Upload video if file upload
    if (post.media_path && !post.media_url) {
      const filePath = path.join(uploadDir, post.media_path);
      const fileSize = fs.statSync(filePath).size;
      const fileBuffer = fs.readFileSync(filePath);

      await axios.put(upload_url, fileBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': `bytes 0-${fileSize - 1}/${fileSize}`,
          'Content-Length': fileSize
        },
        maxBodyLength: Infinity,
        timeout: 120000
      });
    }

    return { id: publish_id, platform: 'tiktok' };
  } catch (err) {
    const message = err.response?.data?.error?.message || err.message;
    throw new Error(`TikTok publish failed: ${message}`);
  }
}

module.exports = { publishTikTokPost };
