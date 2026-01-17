const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardStats, getAdvancedAnalytics } = require('../controllers/dashboardController');

// Protected route - admin only
router.get('/stats', protect, getDashboardStats);
router.get('/analytics', protect, getAdvancedAnalytics);

module.exports = router;
