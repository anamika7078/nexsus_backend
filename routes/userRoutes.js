const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile,
    updateProfile,
    changePassword,
    updateNotificationSettings,
    getRegistrationSecret,
    updateRegistrationSecret
} = require('../controllers/userController');

// All routes are protected with authentication
router.use(protect);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.patch('/profile', updateProfile);

// Change password
router.patch('/password', changePassword);

// Update notification settings
router.patch('/notifications', updateNotificationSettings);

// Security settings - Registration Master Key
router.get('/registration-secret', getRegistrationSecret);
router.patch('/registration-secret', updateRegistrationSecret);

module.exports = router;
