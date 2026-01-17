const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createQuote,
    getAllQuotes,
    getQuoteById,
    updateQuoteStatus,
    deleteQuote
} = require('../controllers/quoteController');

// Public route - anyone can submit a quote
router.post('/', createQuote);

// Protected admin routes
router.get('/', protect, getAllQuotes);
router.get('/:id', protect, getQuoteById);
router.patch('/:id/status', protect, updateQuoteStatus);
router.delete('/:id', protect, deleteQuote);

module.exports = router;
