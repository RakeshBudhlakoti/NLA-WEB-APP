const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const engagementController = require('../controllers/engagement.controller');

// Likes
router.post('/likes/:postId', protect, engagementController.likePost);
router.delete('/likes/:postId', protect, engagementController.unlikePost);
router.get('/likes/check/:postId', protect, engagementController.checkLike);

// Comments
router.post('/comments', protect, engagementController.addComment);
router.get('/comments', engagementController.getComments);
router.delete('/comments/:id', protect, engagementController.deleteComment);

module.exports = router;
