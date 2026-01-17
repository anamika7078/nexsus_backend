const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String, default: '' },
    service: { type: String, required: true },
    budget: { type: String, default: 'Not Specified' },
    timeline: { type: String, default: 'Not Specified' },
    message: { type: String, default: '' },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Reviewed', 'Sent', 'Accepted', 'Declined']
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quote', quoteSchema);
