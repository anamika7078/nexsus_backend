const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
