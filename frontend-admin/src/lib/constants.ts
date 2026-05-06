export const isProd = process.env.NODE_ENV === 'production';

// Centralized Environment-Aware URLs
// In Production, we use relative paths since Vercel proxies /api/v1 and /uploads to the AWS server
export const API_URL = isProd ? '/api/v1' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1');
export const UPLOADS_BASE_URL = isProd ? '/uploads' : (process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5000/uploads');

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
  
  // Clean up legacy localhost URLs from database
  if (filename.includes('localhost:5000')) {
    const parts = filename.split('/uploads/');
    if (parts.length > 1) {
      // Reconstruct using the relative folder/filename part
      return `${UPLOADS_BASE_URL}/${parts[1]}`;
    }
  }

  if (filename.startsWith('http')) return filename; 
  return `${UPLOADS_BASE_URL}/${folder}/${filename}`;
};
