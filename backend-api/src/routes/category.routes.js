const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/categories', categoryController.getCategories);
router.post('/categories', protect, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.createCategory);
router.put('/categories/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.updateCategory);
router.delete('/categories/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.deleteCategory);
router.get('/tags', categoryController.getTags);

module.exports = router;
