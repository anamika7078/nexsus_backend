const { sendAdminMail } = require('../services/emailService');
const Lead = require('../models/Lead');

// Handle Contact Form Submission
const submitContact = async (req, res) => {
    const { name, email, message, phone, type } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        // 1. Save to MongoDB
        const newLead = new Lead({
            name,
            email,
            message,
            phone,
            type: type || 'Contact Form'
        });
        const savedLead = await newLead.save();

        // 2. Send Email
        await sendAdminMail({ ...req.body, ...savedLead._doc });

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
        // 1. Save to MongoDB
        const newLead = new Lead({
            name: name || 'Anonymous User',
            email,
            message: `Interested in: ${interest}`,
            type: `Chatbot (${role})`
        });
        await newLead.save();

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
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json({ success: true, leads });
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete Lead
const deleteLead = async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Lead deleted" });
    } catch (error) {
        console.error("Error deleting lead:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { submitContact, submitBotLead, getAllLeads, deleteLead };
