const API_URL = process.env.API_URL || 'http://localhost:5000';
const UPLOADS_BASE_URL = `${API_URL}/uploads`;

module.exports = {
  API_URL,
  UPLOADS_BASE_URL,
  UPLOAD_PATHS: {
    AVATARS: '/avatars',
    LOGOS: '/logos',
    POSTS: '/posts'
  }
};
