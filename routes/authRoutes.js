const express = require('express');
const router = express.Router();
const { login, register, forgotPassword } = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);

// Temporary setup route to create first admin
router.get('/setup', async (req, res) => {
    try {
        const adminEmail = 'admin@gmail.com';
        const plainPassword = 'Admin@123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        let user = await User.findOne({ email: adminEmail });
        if (user) {
            // Update password directly without triggering pre-save hook
            await User.updateOne({ email: adminEmail }, { $set: { password: hashedPassword } });
            return res.send(`Admin password updated! Email: ${adminEmail}, Password: ${plainPassword}`);
        }

        // Create new user with pre-hashed password
        const newUser = new User({ email: adminEmail, password: hashedPassword });
        // Skip validation to avoid pre-save hook
        await newUser.save({ validateBeforeSave: false });
        res.send(`Admin created! Email: ${adminEmail}, Password: ${plainPassword}. PLEASE DELETE THIS ROUTE IN PRODUCTION.`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
