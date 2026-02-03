const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quote = sequelize.define('Quote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    service: {
        type: DataTypes.STRING,
        allowNull: false
    },
    budget: {
        type: DataTypes.STRING,
        defaultValue: 'Not Specified'
    },
    timeline: {
        type: DataTypes.STRING,
        defaultValue: 'Not Specified'
    },
    message: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Reviewed', 'Sent', 'Accepted', 'Declined'),
        defaultValue: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = Quote;
