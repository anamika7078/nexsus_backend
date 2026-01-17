const express = require('express');
const router = express.Router();
const { submitContact, submitBotLead, getAllLeads, deleteLead } = require('../controllers/contactController');

const { protect } = require('../middleware/authMiddleware');

router.post('/contact', submitContact);
router.post('/chatbot/lead', submitBotLead);
router.get('/leads', protect, getAllLeads);
router.delete('/leads/:id', protect, deleteLead);

module.exports = router;
