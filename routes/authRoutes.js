const express = require('express');
const router = express.Router();
const {
    login,
    register,
    forgotPassword,
    refreshToken,
    logout,
    socialLogin
} = require('../controllers/authController');
const User = require('../models/User');

router.post('/login', login);
router.post('/register', register);
router.post('/social-login', socialLogin);
router.post('/forgot-password', forgotPassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Temporary setup route to create first admin
router.get('/setup', async (req, res) => {
    try {
        const adminEmail = 'admin@gmail.com';
        const plainPassword = 'Admin@123';

        let user = await User.findOne({ where: { email: adminEmail } });
        if (user) {
            await user.update({ password: plainPassword });
            return res.send(`Admin password updated! Email: ${adminEmail}, Password: ${plainPassword}`);
        }

        await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: plainPassword,
            role: 'admin'
        });

        res.send(`Admin created! Email: ${adminEmail}, Password: ${plainPassword}. PLEASE DELETE THIS ROUTE IN PRODUCTION.`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
