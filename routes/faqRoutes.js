const express = require('express');
const router = express.Router();
const { getAllFAQs, createFAQ, deleteFAQ, queryBot } = require('../controllers/faqController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllFAQs);
router.post('/', protect, createFAQ);
router.delete('/:id', protect, deleteFAQ);
router.post('/query', queryBot);

module.exports = router;
