const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    companyName: { type: String, default: 'Nexsus Cyber Solutions' },
    emailNotifications: {
        newLeads: { type: Boolean, default: true },
        weeklySummary: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true }
    },
    refreshTokens: [
        {
            tokenHash: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            expiresAt: { type: Date }
        }
    ],
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
