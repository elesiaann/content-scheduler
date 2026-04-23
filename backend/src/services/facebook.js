const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const GRAPH_API = 'https://graph.facebook.com/v18.0';

async function publishFacebookPost(post, accessToken, pageId) {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');

    if (post.media_type === 'video' && (post.media_path || post.media_url)) {
      // Video post
      return await publishFacebookVideo(post, accessToken, pageId, uploadDir);
    } else if (post.media_type === 'image' && (post.media_path || post.media_url)) {
      // Photo post
      return await publishFacebookPhoto(post, accessToken, pageId, uploadDir);
    } else {
      // Text-only post
      const res = await axios.post(`${GRAPH_API}/${pageId}/feed`, {
        message: post.caption || post.title,
        access_token: accessToken
      });
      return { id: res.data.id, platform: 'facebook' };
    }
  } catch (err) {
    const message = err.response?.data?.error?.message || err.message;
    throw new Error(`Facebook publish failed: ${message}`);
  }
}

async function publishFacebookPhoto(post, accessToken, pageId, uploadDir) {
  const params = {
    caption: post.caption || post.title,
    access_token: accessToken
  };

  if (post.media_url) {
    params.url = post.media_url;
    const res = await axios.post(`${GRAPH_API}/${pageId}/photos`, params);
    return { id: res.data.id, platform: 'facebook' };
  } else if (post.media_path) {
    const form = new FormData();
    form.append('caption', post.caption || post.title);
    form.append('access_token', accessToken);
    form.append('source', fs.createReadStream(path.join(uploadDir, post.media_path)));

    const res = await axios.post(`${GRAPH_API}/${pageId}/photos`, form, {
      headers: form.getHeaders()
    });
    return { id: res.data.id, platform: 'facebook' };
  }
}

async function publishFacebookVideo(post, accessToken, pageId, uploadDir) {
  const form = new FormData();
  form.append('description', post.caption || post.title);
  form.append('access_token', accessToken);

  if (post.media_url) {
    form.append('file_url', post.media_url);
  } else if (post.media_path) {
    form.append('source', fs.createReadStream(path.join(uploadDir, post.media_path)));
  }

  const res = await axios.post(`${GRAPH_API}/${pageId}/videos`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000
  });

  return { id: res.data.id, platform: 'facebook' };
}

module.exports = { publishFacebookPost };
