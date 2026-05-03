const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { postLimiter } = require('../middlewares/rate-limit.middleware');
const postController = require('../controllers/post.controller');

// Read operations — no postLimiter
router.get('/', postController.getPosts);
router.get('/my-posts', protect, postController.getMyPosts);

const searchController = require('../controllers/search.controller');
router.get('/trending', searchController.getTrending);
router.get('/recommended', searchController.getRecommended);

// View increment — no postLimiter (so browsing doesn't block you)
router.post('/:id/view', postController.incrementView);
router.get('/:id', postController.getPostById);

// Write operations — apply postLimiter
router.post('/', protect, postLimiter, postController.createPost);
router.put('/:id', protect, postLimiter, postController.updatePost);
router.put('/:id/submit', protect, postLimiter, postController.submitPost);
router.delete('/:id', protect, postLimiter, postController.deletePost);

module.exports = router;
