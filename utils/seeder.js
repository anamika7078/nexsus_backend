const User = require('../models/User');

const seedSuperAdmin = async () => {
    try {
        const email = 'superadmin@gmail.com';
        const password = 'Admin@123';
        const role = 'superadmin';

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('ℹ️  Super Admin already exists.');
            return;
        }

        const superAdmin = new User({
            name: 'Super Admin',
            email,
            password,
            role,
            companyName: 'Nexsus Cyber Solutions',
            phone: '0000000000'
        });

        await superAdmin.save();
        console.log('✅ Super Admin created successfully.');
    } catch (error) {
        console.error('❌ Error seeding Super Admin:', error);
    }
};

module.exports = seedSuperAdmin;
