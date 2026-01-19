const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const requireEnv = (key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
    }
    return process.env[key];
};

const getEnv = (key, fallback) => process.env[key] || fallback;

const signAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        requireEnv('JWT_SECRET'),
        { expiresIn: getEnv('JWT_EXPIRES_IN', '1d') }
    );
};

const signRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, type: 'refresh' },
        requireEnv('JWT_REFRESH_SECRET'),
        { expiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d') }
    );
};

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
    signAccessToken,
    signRefreshToken,
    hashToken
};
