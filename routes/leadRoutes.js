const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAllLeads,
    getLeadById,
    updateLeadStatus,
    deleteLead
} = require('../controllers/leadController');

// All routes are protected with authentication
router.use(protect);

// Get all leads with pagination and filtering
router.get('/', getAllLeads);

// Get single lead by ID
router.get('/:id', getLeadById);

// Update lead status
router.patch('/:id/status', updateLeadStatus);

// Delete lead
router.delete('/:id', deleteLead);

module.exports = router;
