const API_BASE_URL = 'http://localhost:5000/api/v1';

export const fetchApi = async (endpoint: string, options: any = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || 'Something went wrong');
    error.data = data; // Attach full response data for field-level errors
    throw error;
  }
  return data;
};

export const uploadFileToS3 = async (file: File, folder: string = 'uploads') => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const formData = new FormData();
  formData.append('file', file);

  // Avatars during registration should not send token to avoid 401
  const isAvatar = folder === 'avatars';
  
  const response = await fetch(`${API_BASE_URL}/upload/file?folder=${folder}`, {
    method: 'POST',
    headers: {
      ...((token && !isAvatar) ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    if (data.message === 'Validation Error' && Array.isArray(data.error) && data.error.length > 0) {
      throw new Error(data.error[0].message);
    }
    throw new Error(data.message || 'Upload failed');
  }
  return data.data.fileUrl;
};
