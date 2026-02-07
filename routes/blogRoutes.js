const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/blogs', blogController.getPublishedBlogs);
router.get('/blogs/:slug', blogController.getBlogBySlug);
router.get('/categories', blogController.getCategories);

// Admin routes (protected)
router.post('/blogs', protect, blogController.createBlog);
router.get('/admin/blogs', protect, blogController.getAllBlogs);
router.put('/blogs/:id', protect, blogController.updateBlog);
router.delete('/blogs/:id', protect, blogController.deleteBlog);

module.exports = router;
