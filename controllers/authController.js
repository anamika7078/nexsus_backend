const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', {
            expiresIn: '1d'
        });

        res.json({ success: true, token, user: { email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Register user
const register = async (req, res) => {
    const { name, email, password, secretKey } = req.body;
    try {
        // Find or initialize registration secret
        let secretSetting = await SystemSetting.findOne({ key: 'registration_secret' });
        if (!secretSetting) {
            secretSetting = new SystemSetting({
                key: 'registration_secret',
                value: '12345',
                description: 'Master key for new admin registrations'
            });
            await secretSetting.save();
        }

        // Verify secret key
        if (secretKey !== secretSetting.value) {
            return res.status(401).json({ success: false, message: 'Invalid registration access key' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const newUser = new User({
            name,
            email,
            password,
            role: 'admin' // Default to admin for this specific project
        });

        await newUser.save();
        res.json({ success: true, message: 'Admin account created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Forgot Password stub
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        // Whether user exists or not, we return success for security (prevents account enumeration)
        res.json({ success: true, message: 'If an account exists with that email, reset instructions have been sent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error processing request' });
    }
};

module.exports = { login, register, forgotPassword };
