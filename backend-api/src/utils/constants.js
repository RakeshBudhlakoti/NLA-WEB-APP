const isProd = process.env.NODE_ENV === 'production';

// ─── Environment-Aware URLs ──────────────────────────────────────────────────
const FRONTEND_URL = isProd 
  ? (process.env.FRONTEND_URL || 'https://nla-web-portal.vercel.app') 
  : 'http://localhost:3000';

const ADMIN_URL = isProd 
  ? (process.env.ADMIN_URL || 'https://nla-admin-portal.vercel.app') 
  : 'http://localhost:3001';

const API_URL = process.env.API_URL || (isProd ? 'http://3.137.158.226' : 'http://localhost:5000');
const UPLOADS_BASE_URL = `${API_URL}/uploads`;

// ─── Email / SMTP Configuration ──────────────────────────────────────────────
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'rbkstaging@gmail.com',
    pass: process.env.SMTP_PASS || 'xxkb bcyd iisf bvmy'
  }
};

// ─── Brand Identity ──────────────────────────────────────────────────────────
const BRAND_CONFIG = {
  name: 'NLA Sports',
  color: '#1d4ed8',
  accent: '#facc15',
  logo: 'https://img1.wsimg.com/isteam/ip/8fd845d7-9fa4-4d21-b4c1-c8821f3d534d/Gemini_Generated_Image_3z1rwl3z1rwl3z1r.png',
  baseUrl: FRONTEND_URL,
  adminUrl: ADMIN_URL,
  from: `"NLA Sports" <${process.env.SMTP_USER || 'rbkstaging@gmail.com'}>`
};

// ─── CORS Whitelist ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://nla-web-portal.vercel.app',
  'https://nla-admin-portal.vercel.app',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

module.exports = {
  isProd,
  FRONTEND_URL,
  ADMIN_URL,
  API_URL,
  UPLOADS_BASE_URL,
  ALLOWED_ORIGINS,
  SMTP_CONFIG,
  BRAND_CONFIG,
  UPLOAD_PATHS: {
    AVATARS: '/avatars',
    LOGOS: '/logos',
    POSTS: '/posts'
  }
};
