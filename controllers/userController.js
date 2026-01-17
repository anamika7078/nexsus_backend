const User = require('../models/User');
const bcrypt = require('bcryptjs');
const SystemSetting = require('../models/SystemSetting');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, companyName, email } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (companyName !== undefined) updateData.companyName = companyName;
        if (email !== undefined) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            updateData.email = email;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
    try {
        const { newLeads, weeklySummary, systemUpdates } = req.body;

        const updateData = { emailNotifications: {} };
        if (newLeads !== undefined) updateData.emailNotifications.newLeads = newLeads;
        if (weeklySummary !== undefined) updateData.emailNotifications.weeklySummary = weeklySummary;
        if (systemUpdates !== undefined) updateData.emailNotifications.systemUpdates = systemUpdates;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user,
            message: 'Notification settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification settings' });
    }
};

// Get registration secret
exports.getRegistrationSecret = async (req, res) => {
    try {
        let secretSetting = await SystemSetting.findOne({ key: 'registration_secret' });
        if (!secretSetting) {
            secretSetting = new SystemSetting({
                key: 'registration_secret',
                value: '12345',
                description: 'Master key for new admin registrations'
            });
            await secretSetting.save();
        }
        res.json({ success: true, secretKey: secretSetting.value });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch registration secret' });
    }
};

// Update registration secret
exports.updateRegistrationSecret = async (req, res) => {
    try {
        // Only the master admin can update system security settings
        const user = await User.findById(req.user.id);
        if (!user || user.email !== 'admin@gmail.com') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only master admin can update security settings.'
            });
        }

        const { newSecret } = req.body;
        if (!newSecret) {
            return res.status(400).json({ success: false, message: 'New secret is required' });
        }

        let secretSetting = await SystemSetting.findOne({ key: 'registration_secret' });
        if (secretSetting) {
            secretSetting.value = newSecret;
            secretSetting.updatedAt = Date.now();
            await secretSetting.save();
        } else {
            secretSetting = new SystemSetting({
                key: 'registration_secret',
                value: newSecret
            });
            await secretSetting.save();
        }

        res.json({ success: true, message: 'Registration master key updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update registration secret' });
    }
};
