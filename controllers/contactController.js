const { sendAdminMail } = require('../services/emailService');
const Lead = require('../models/Lead');

// Handle Contact Form Submission
const submitContact = async (req, res) => {
    const { name, email, message, phone, type } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        // 1. Save to MySQL
        const savedLead = await Lead.create({
            name,
            email,
            message,
            phone,
            type: type || 'Contact Form'
        });

        // 2. Send Email
        await sendAdminMail({ ...req.body, ...savedLead.dataValues });

        res.json({ success: true, message: "Lead submitted successfully", lead: savedLead });
    } catch (error) {
        console.error("Error saving lead:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Handle Chatbot Lead Capture
const submitBotLead = async (req, res) => {
    const { name, email, role, interest } = req.body;

    try {
        // 1. Save to MySQL
        await Lead.create({
            name: name || 'Anonymous User',
            email,
            message: `Interested in: ${interest}`,
            type: `Chatbot (${role})`
        });

        // 2. Send Email (Optional for bot leads)
        // await sendAdminMail(newLead); 

        res.json({ success: true, message: "Bot lead captured" });
    } catch (error) {
        console.error("Error saving bot lead:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get All Leads (Protected)
const getAllLeads = async (req, res) => {
    try {
        const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, leads });
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete Lead
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        await lead.destroy();
        res.json({ success: true, message: "Lead deleted" });
    } catch (error) {
        console.error("Error deleting lead:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { submitContact, submitBotLead, getAllLeads, deleteLead };
