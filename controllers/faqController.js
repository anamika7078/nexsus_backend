const FAQ = require('../models/FAQ');
const { Op } = require('sequelize');

const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createFAQ = async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const newFAQ = await FAQ.create({ question, answer, category });
        res.json({ success: true, faq: newFAQ });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByPk(req.params.id);
        if (!faq) {
            return res.status(404).json({ success: false, message: 'FAQ not found' });
        }
        await faq.destroy();
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
            where: {
                question: { [Op.like]: `%${message}%` }
            }
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
