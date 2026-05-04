export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.137.158.226/api/v1';
export const UPLOADS_BASE_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://3.137.158.226/uploads';

export const UPLOAD_FOLDERS = {
  AVATARS: 'avatars',
  LOGOS: 'logos',
  POSTS: 'posts',
  CATEGORIES: 'categories',
  STORIES: 'stories',
  BANNERS: 'banners'
};

export const getImageUrl = (filename: string | null | undefined, folder: string) => {
  if (!filename) return undefined;
  if (filename.startsWith('http')) return filename; // Fallback for old records
  return `${UPLOADS_BASE_URL}/${folder}/${filename}`;
};
