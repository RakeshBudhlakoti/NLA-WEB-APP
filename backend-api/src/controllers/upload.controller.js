const { sendSuccess, sendError } = require('../utils/response');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Try to get folder from query or body
      const folder = req.query.folder || req.body.folder || 'uploads';
      
      // Use absolute path for reliability
      const baseDir = path.resolve(__dirname, '../../uploads');
      const dir = path.join(baseDir, folder);
      
      console.log(`📁 Attempting to upload to: ${dir}`);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        console.log(`✨ Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    } catch (err) {
      console.error('❌ Multer Destination Error:', err);
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname) || '.bin';
    const newName = `${uuidv4()}${extension}`;
    console.log(`📄 Generated filename: ${newName}`);
    cb(null, newName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadProxy = async (req, res) => {
  try {
    console.log('🏁 uploadProxy started. Files:', req.file ? '1 file' : '0 files');
    console.log('📦 Headers:', JSON.stringify(req.headers, null, 2));
    
    if (!req.file) {
      console.error('❌ No file found in request.');
      return sendError(res, 'No file uploaded. Please ensure you are sending the file with the field name "file".', null, 400);
    }

    const folder = req.query.folder || req.body.folder || 'uploads';
    const fileUrl = req.file.filename;
    
    console.log(`✅ File successfully processed: ${fileUrl} in folder: ${folder}`);
    return sendSuccess(res, 'File uploaded successfully', { fileUrl });
  } catch (error) {
    console.error('❌ Local Upload Proxy Error:', error);
    return sendError(res, 'Local Upload Failed during proxying: ' + error.message, error.stack, 500);
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
