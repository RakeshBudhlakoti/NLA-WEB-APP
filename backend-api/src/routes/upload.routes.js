const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/generate-url', protect, uploadController.generateUploadUrl);
router.post('/file', (req, res, next) => { console.log('📁 Public Upload Route Hit'); next(); }, uploadController.uploadMiddleware, uploadController.uploadProxy);

module.exports = router;
