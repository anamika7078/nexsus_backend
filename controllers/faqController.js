const FAQ = require('../models/FAQ');

const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        res.json({ success: true, faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createFAQ = async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const newFAQ = new FAQ({ question, answer, category });
        await newFAQ.save();
        res.json({ success: true, faq: newFAQ });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteFAQ = async (req, res) => {
    try {
        await FAQ.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'FAQ deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// For chatbot to query
const queryBot = async (req, res) => {
    const { message } = req.body;
    try {
        // Simple search (case insensitive)
        const faq = await FAQ.findOne({
            question: { $regex: message, $options: 'i' }
        });

        if (faq) {
            res.json({ success: true, answer: faq.answer });
        } else {
            res.json({ success: false, message: 'No answer found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllFAQs, createFAQ, deleteFAQ, queryBot };
