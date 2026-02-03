const User = require('../models/User');

const seedSuperAdmin = async () => {
    try {
        const email = 'superadmin@gmail.com';
        const password = 'Admin@123';
        const role = 'superadmin';

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            console.log('ℹ️  Super Admin already exists.');
            return;
        }

        const superAdmin = await User.create({
            name: 'Super Admin',
            email,
            password,
            role,
            companyName: 'Nexsus Cyber Solutions',
            phone: '0000000000'
        });

        console.log('✅ Super Admin created successfully.');
    } catch (error) {
        console.error('❌ Error seeding Super Admin:', error);
    }
};

module.exports = seedSuperAdmin;
