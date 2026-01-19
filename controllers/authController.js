const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const jwt = require('jsonwebtoken');
const { signAccessToken, signRefreshToken, hashToken } = require('../utils/jwt');

const persistRefreshToken = async (userId, refreshToken) => {
    const decoded = jwt.decode(refreshToken);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : undefined;
    const tokenHash = hashToken(refreshToken);

    await User.updateOne(
        { _id: userId },
        {
            $push: {
                refreshTokens: {
                    $each: [{ tokenHash, createdAt: new Date(), expiresAt }],
                    $slice: -5
                }
            }
        }
    );
};

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

        const token = signAccessToken(user);
        const refreshToken = signRefreshToken(user);
        await persistRefreshToken(user._id, refreshToken);

        await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

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

        const token = signAccessToken(newUser);
        const refreshToken = signRefreshToken(newUser);
        await persistRefreshToken(newUser._id, refreshToken);

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
        const user = await User.findOne({ email });
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
            _id: decoded.id,
            'refreshTokens.tokenHash': tokenHash
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const newAccessToken = signAccessToken(user);
        const newRefreshToken = signRefreshToken(user);
        const decodedRefresh = jwt.decode(newRefreshToken);

        await User.updateOne(
            { _id: user._id },
            {
                $pull: { refreshTokens: { tokenHash } },
                $push: {
                    refreshTokens: {
                        $each: [
                            {
                                tokenHash: hashToken(newRefreshToken),
                                createdAt: new Date(),
                                expiresAt: decodedRefresh?.exp
                                    ? new Date(decodedRefresh.exp * 1000)
                                    : undefined
                            }
                        ],
                        $slice: -5
                    }
                }
            }
        );

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

        await User.updateOne(
            { _id: decoded.id },
            { $pull: { refreshTokens: { tokenHash } } }
        );

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
