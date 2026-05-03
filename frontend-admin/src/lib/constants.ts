export const API_URL = 'http://localhost:5000/api/v1';
export const UPLOADS_BASE_URL = 'http://localhost:5000/uploads';

export const UPLOAD_FOLDERS = {
  AVATARS: 'avatars',
  LOGOS: 'logos',
  POSTS: 'posts',
  CATEGORIES: 'categories',
  STORIES: 'stories',
  BANNERS: 'banners'
};

export const getImageUrl = (filename: string | null | undefined, folder: string) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename; // Fallback for old records
  return `${UPLOADS_BASE_URL}/${folder}/${filename}`;
};
