const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

// Important: Specific routes must come before parameterized routes like /:id
router.get('/leaderboard', userController.getLeaderboard);
router.get('/stats', protect, userController.getDashboardStats);
router.put('/me', protect, userController.updateMe);
router.put('/change-password', protect, userController.changePassword);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

module.exports = router;
