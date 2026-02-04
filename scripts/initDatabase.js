const sequelize = require('../config/database');
const User = require('../models/User');
const Lead = require('../models/Lead');
const FAQ = require('../models/FAQ');
const Quote = require('../models/Quote');
const SystemSetting = require('../models/SystemSetting');

const initDatabase = async () => {
    try {
        console.log('🔄 Starting database initialization...');

        // Test connection first
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync all models (create tables or update them)
        await sequelize.sync({ alter: true });
        console.log('✅ All models were synchronized successfully.');

        // Check if any data exists
        const userCount = await User.count();
        const leadCount = await Lead.count();
        const faqCount = await FAQ.count();
        const quoteCount = await Quote.count();

        console.log('\n📊 Database Statistics:');
        console.log(`   Users: ${userCount}`);
        console.log(`   Leads: ${leadCount}`);
        console.log(`   FAQs: ${faqCount}`);
        console.log(`   Quotes: ${quoteCount}`);

        console.log('\n🎉 Database initialization completed successfully!');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

// Run if called directly
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;
