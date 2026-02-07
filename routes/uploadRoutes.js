const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.post('/upload', protect, uploadController.uploadImage);
router.delete('/upload/:filename', protect, uploadController.deleteImage);

module.exports = router;
