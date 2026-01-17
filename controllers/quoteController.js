const Quote = require('../models/Quote');

// Create new quote request (Public - no auth required)
exports.createQuote = async (req, res) => {
    try {
        const { name, email, phone, company, service, budget, timeline, message } = req.body;

        // Validation
        if (!name || !email || !phone || !service) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, phone, and service'
            });
        }

        const quote = new Quote({
            name,
            email,
            phone,
            company,
            service,
            budget,
            timeline,
            message
        });

        await quote.save();

        res.status(201).json({
            success: true,
            message: 'Quote request submitted successfully! We will contact you soon.',
            quote
        });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ success: false, message: 'Failed to submit quote request' });
    }
};

// Get all quotes (Admin only)
exports.getAllQuotes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Support filtering by status and search
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { service: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const quotes = await Quote.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Quote.countDocuments(filter);

        res.json({
            success: true,
            quotes,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch quotes' });
    }
};

// Get single quote by ID (Admin only)
exports.getQuoteById = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);

        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        res.json({ success: true, quote });
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch quote' });
    }
};

// Update quote status (Admin only)
exports.updateQuoteStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Pending', 'Reviewed', 'Sent', 'Accepted', 'Declined'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        res.json({ success: true, quote, message: 'Quote status updated successfully' });
    } catch (error) {
        console.error('Error updating quote status:', error);
        res.status(500).json({ success: false, message: 'Failed to update quote status' });
    }
};

// Delete quote (Admin only)
exports.deleteQuote = async (req, res) => {
    try {
        const quote = await Quote.findByIdAndDelete(req.params.id);

        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        res.json({ success: true, message: 'Quote deleted successfully' });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).json({ success: false, message: 'Failed to delete quote' });
    }
};
