const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const notificationController = require('../controllers/notification.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.post('/notifications/read-all', notificationController.markAllRead);

router.get('/posts', adminController.getAdminPosts);
router.get('/posts/trash', adminController.getDeletedPosts);
router.put('/posts/:id/approve', adminController.approvePost);
router.put('/posts/:id/reject', adminController.rejectPost);
router.delete('/posts/:id', adminController.deleteAdminPost);
router.put('/posts/:id/restore', adminController.restorePost);

router.get('/users', adminController.getAdminUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createAdminUser);
router.put('/users/:id', adminController.editUser);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteAdminUser);
router.put('/users/:id/restore', adminController.restoreUser);
router.put('/users/:id/role', adminController.changeUserRole);

router.get('/stats', adminController.getStats);
router.get('/top-posts', adminController.getTopPosts);
router.get('/top-users', adminController.getTopUsers);

router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);

module.exports = router;
