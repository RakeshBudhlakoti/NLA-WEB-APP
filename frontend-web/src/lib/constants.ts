export const API_URL = 'http://localhost:5000/api/v1';
export const UPLOADS_BASE_URL = 'http://localhost:5000/uploads';

export const UPLOAD_FOLDERS = {
  AVATARS: 'avatars',
  LOGOS: 'logos',
  POSTS: 'posts',
  STORIES: 'stories',
  BANNERS: 'banners'
};

export const getImageUrl = (filename: string | null | undefined, folder: string) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename; // Fallback for old records
  return `${UPLOADS_BASE_URL}/${folder}/${filename}`;
};

// Google reCAPTCHA v2 Site Key
// Test key (always passes) — replace with real key from https://www.google.com/recaptcha/admin
export const RECAPTCHA_SITE_KEY = "6Lcp4s8sAAAAAPFsLBJ5RWDr07T4Ankz0jloPWKy";
