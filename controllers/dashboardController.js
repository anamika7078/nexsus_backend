const Lead = require('../models/Lead');
const Quote = require('../models/Quote');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Get total counts
        const totalLeads = await Lead.count();
        const totalQuotes = await Quote.count();

        // Get status breakdowns
        // Sequelize returns plain objects by default or standard instances. 
        // We use raw: true to get simple objects.
        const leadsByStatus = await Lead.findAll({
            attributes: [
                ['status', '_id'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        const quotesByStatus = await Quote.findAll({
            attributes: [
                ['status', '_id'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Get recent leads (last 5)
        const recentLeads = await Lead.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'email', 'type', 'status', 'createdAt']
        });

        // Get recent quotes (last 5)
        const recentQuotes = await Quote.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'email', 'service', 'status', 'createdAt']
        });

        // Calculate counts for this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const leadsThisWeek = await Lead.count({
            where: {
                createdAt: {
                    [Op.gte]: oneWeekAgo
                }
            }
        });

        const quotesThisWeek = await Quote.count({
            where: {
                createdAt: {
                    [Op.gte]: oneWeekAgo
                }
            }
        });

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
        // Note: TO_CHAR is PostgreSQL specific. If using MySQL use DATE_FORMAT(createdAt, '%Y-%m-%d')
        const dailyLeads = await Lead.findAll({
            attributes: [
                [sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM-DD'), '_id'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.gte]: startDate
                }
            },
            group: [sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM-DD')],
            order: [[sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM-DD'), 'ASC']],
            raw: true
        });

        // Daily quotes
        const dailyQuotes = await Quote.findAll({
            attributes: [
                [sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM-DD'), '_id'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.gte]: startDate
                }
            },
            group: [sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM-DD')],
            order: [[sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM-DD'), 'ASC']],
            raw: true
        });

        // Service distribution
        const serviceDistribution = await Quote.findAll({
            attributes: [
                ['service', '_id'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.gte]: startDate
                }
            },
            group: ['service'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 8,
            raw: true
        });

        // Conversion trends
        const conversions = await Lead.count({
            where: {
                status: 'Closed',
                createdAt: {
                    [Op.gte]: startDate
                }
            }
        });

        const totalLeads = await Lead.count({
            where: {
                createdAt: {
                    [Op.gte]: startDate
                }
            }
        });

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
