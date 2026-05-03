const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { toggleBookmark, getBookmarks, getBookmarkIds } = require('../controllers/bookmark.controller');

router.post('/:postId', protect, toggleBookmark);
router.get('/', protect, getBookmarks);
router.get('/ids', protect, getBookmarkIds);

module.exports = router;
