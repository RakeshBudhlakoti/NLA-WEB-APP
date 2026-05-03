const { sendSuccess, sendError } = require('../utils/response');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Try to get folder from query or body
    const folder = req.query.folder || req.body.folder || 'uploads';
    const dir = path.join(__dirname, '../../uploads', folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname) || '.bin';
    cb(null, `${uuidv4()}${extension}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadProxy = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded');
    }

    const folder = req.query.folder || req.body.folder || 'uploads';
    const fileUrl = req.file.filename;
    
    return sendSuccess(res, 'File uploaded successfully', { fileUrl });
  } catch (error) {
    console.error('Local Upload Error:', error);
    return sendError(res, 'Local Upload Failed', error.message);
  }
};

const generateUploadUrl = async (req, res) => {
    return sendError(res, 'S3 Upload is disabled. Use /api/v1/upload/file instead.');
};

module.exports = { 
  generateUploadUrl, 
  uploadProxy, 
  uploadMiddleware: upload.single('file') 
};
