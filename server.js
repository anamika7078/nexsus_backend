require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const faqRoutes = require('./routes/faqRoutes');
const leadRoutes = require('./routes/leadRoutes');
const userRoutes = require('./routes/userRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const seedSuperAdmin = require('./utils/seeder');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : '*';
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

// Routes
app.use('/api', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/user', userRoutes);
app.use('/admin/quotes', quoteRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Database Connection and Sync
sequelize.sync({ force: false })
    .then(() => {
        console.log(`✅ ${sequelize.getDialect().toUpperCase()} Database Connected & Synced`);
        seedSuperAdmin();
    })
    .catch(err => console.error('❌ MySQL Connection Error:', err));

// Health Check
app.get('/', (req, res) => {
    res.send('Nexsus Cyber API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
