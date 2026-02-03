const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const jwt = require('jsonwebtoken');
const { signAccessToken, signRefreshToken, hashToken } = require('../utils/jwt');

const persistRefreshToken = async (userId, refreshToken) => {
    const decoded = jwt.decode(refreshToken);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : undefined;
    const tokenHash = hashToken(refreshToken);

    const user = await User.findByPk(userId);
    if (user) {
        const currentTokens = user.refreshTokens || [];
        currentTokens.push({ tokenHash, createdAt: new Date(), expiresAt });

        // Keep only last 5 tokens
        const updatedTokens = currentTokens.slice(-5);

        await user.update({ refreshTokens: updatedTokens });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = signAccessToken(user);
        const refreshToken = signRefreshToken(user);
        await persistRefreshToken(user.id, refreshToken);

        await user.update({ lastLogin: new Date() });

        res.json({
            success: true,
            token,
            refreshToken,
            user: { email: user.email, role: user.role }
        });
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
        let secretSetting = await SystemSetting.findOne({ where: { key: 'registration_secret' } });
        if (!secretSetting) {
            secretSetting = await SystemSetting.create({
                key: 'registration_secret',
                value: '12345',
                description: 'Master key for new admin registrations'
            });
        }

        // Verify secret key
        if (secretKey !== secretSetting.value) {
            return res.status(401).json({ success: false, message: 'Invalid registration access key' });
        }
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role: 'admin' // Default to admin for this specific project
        });

        const token = signAccessToken(newUser);
        const refreshToken = signRefreshToken(newUser);
        await persistRefreshToken(newUser.id, refreshToken);

        res.json({
            success: true,
            message: 'Admin account created successfully',
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Forgot Password stub
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        // Whether user exists or not, we return success for security (prevents account enumeration)
        res.json({ success: true, message: 'If an account exists with that email, reset instructions have been sent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error processing request' });
    }
};

const refreshToken = async (req, res) => {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    try {
        if (!process.env.JWT_REFRESH_SECRET) {
            return res.status(500).json({ success: false, message: 'JWT_REFRESH_SECRET not configured' });
        }
        const decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
        const tokenHash = hashToken(incomingToken);

        const user = await User.findOne({
            where: {
                id: decoded.id
            }
        });

        if (!user || !user.refreshTokens) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const tokenExists = user.refreshTokens.some(token => token.tokenHash === tokenHash);
        if (!tokenExists) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const newAccessToken = signAccessToken(user);
        const newRefreshToken = signRefreshToken(user);
        const decodedRefresh = jwt.decode(newRefreshToken);

        const currentTokens = user.refreshTokens || [];
        const updatedTokens = currentTokens.filter(token => token.tokenHash !== tokenHash);
        updatedTokens.push({
            tokenHash: hashToken(newRefreshToken),
            createdAt: new Date(),
            expiresAt: decodedRefresh?.exp
                ? new Date(decodedRefresh.exp * 1000)
                : undefined
        });

        // Keep only last 5 tokens
        const finalTokens = updatedTokens.slice(-5);

        await user.update({ refreshTokens: finalTokens });

        return res.json({
            success: true,
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Refresh token is not valid' });
    }
};

const logout = async (req, res) => {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    try {
        if (!process.env.JWT_REFRESH_SECRET) {
            return res.status(500).json({ success: false, message: 'JWT_REFRESH_SECRET not configured' });
        }
        const decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
        const tokenHash = hashToken(incomingToken);

        const user = await User.findByPk(decoded.id);
        if (user && user.refreshTokens) {
            const updatedTokens = user.refreshTokens.filter(token => token.tokenHash !== tokenHash);
            await user.update({ refreshTokens: updatedTokens });
        }

        return res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Refresh token is not valid' });
    }
};

module.exports = {
    login,
    register,
    forgotPassword,
    refreshToken,
    logout
};
