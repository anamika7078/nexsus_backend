const Lead = require('../models/Lead');
const Quote = require('../models/Quote');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Get total counts
        const totalLeads = await Lead.countDocuments();
        const totalQuotes = await Quote.countDocuments();

        // Get status breakdowns
        const leadsByStatus = await Lead.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const quotesByStatus = await Quote.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get recent leads (last 5)
        const recentLeads = await Lead.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email type status createdAt');

        // Get recent quotes (last 5)
        const recentQuotes = await Quote.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email service status createdAt');

        // Calculate counts for this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const leadsThisWeek = await Lead.countDocuments({ createdAt: { $gte: oneWeekAgo } });
        const quotesThisWeek = await Quote.countDocuments({ createdAt: { $gte: oneWeekAgo } });

        res.json({
            success: true,
            stats: {
                totalLeads,
                totalQuotes,
                leadsThisWeek,
                quotesThisWeek,
                leadsByStatus,
                quotesByStatus,
                recentLeads,
                recentQuotes
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
    }
};
// Get advanced analytics data
exports.getAdvancedAnalytics = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 14;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Daily leads
        const dailyLeads = await Lead.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Daily quotes
        const dailyQuotes = await Quote.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Service distribution
        const serviceDistribution = await Quote.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$service', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        // Conversion trends
        const conversions = await Lead.countDocuments({ status: 'Closed', createdAt: { $gte: startDate } });
        const totalLeads = await Lead.countDocuments({ createdAt: { $gte: startDate } });

        res.json({
            success: true,
            analytics: {
                dailyLeads,
                dailyQuotes,
                serviceDistribution,
                conversionInfo: {
                    conversions,
                    totalLeads,
                    rate: totalLeads > 0 ? (conversions / totalLeads) * 100 : 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching advanced analytics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch advanced analytics' });
    }
};
