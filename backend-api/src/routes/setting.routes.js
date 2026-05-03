const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public endpoint to get global settings (used by frontend-web)
router.get('/', settingController.getSettings);

// Admin only endpoints
router.use(protect);
router.use(authorize('ADMIN'));

router.put('/', settingController.updateSettings);

module.exports = router;
