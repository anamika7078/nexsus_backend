# MongoDB to MySQL Migration Guide

## Overview
This document outlines the migration of the Nexsus Cyber backend from MongoDB to MySQL using Sequelize ORM.

## Changes Made

### 1. Dependencies Updated
- **Removed**: `mongoose`
- **Added**: `mysql2`, `sequelize`

### 2. Database Configuration
- **New file**: `config/database.js` - Sequelize configuration
- **Updated**: `.env` - MySQL connection parameters

### 3. Models Converted
All MongoDB schemas converted to Sequelize models:
- `User.js` - Authentication and user management
- `Lead.js` - Contact form leads
- `FAQ.js` - Frequently asked questions
- `Quote.js` - Quote requests
- `SystemSetting.js` - System configuration

### 4. Controllers Updated
All controllers updated to use Sequelize syntax:
- `authController.js` - Login, register, token management
- `leadController.js` - Lead management
- `faqController.js` - FAQ management
- `quoteController.js` - Quote management
- `contactController.js` - Contact form handling

### 5. Server and Utilities
- `server.js` - Database connection updated
- `utils/seeder.js` - Super admin seeding updated

## Setup Instructions

### 1. Install MySQL
```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# On macOS
brew install mysql

# On Windows
# Download and install from https://dev.mysql.com/downloads/mysql/
```

### 2. Create Database
```sql
mysql -u root -p
CREATE DATABASE nexsus_cyber;
EXIT;
```

### 3. Update Environment Variables
Edit `.env` file:
```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nexsus_cyber
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 4. Install Dependencies
```bash
cd backend
npm install
```

### 5. Initialize Database
```bash
npm run init-db
```

### 6. Start Server
```bash
npm run dev
```

## Key Differences

### MongoDB vs MySQL Syntax

| MongoDB | Sequelize/MySQL |
|---------|------------------|
| `User.findOne({ email })` | `User.findOne({ where: { email } })` |
| `new User(data).save()` | `User.create(data)` |
| `User.findById(id)` | `User.findByPk(id)` |
| `User.findByIdAndUpdate(id, data)` | `User.findByPk(id).then(user => user.update(data))` |
| `User.findByIdAndDelete(id)` | `User.findByPk(id).then(user => user.destroy())` |
| `collection.find().sort({ createdAt: -1 })` | `Model.findAll({ order: [['createdAt', 'DESC']] })` |
| `$regex: search, $options: 'i'` | `{ [Op.like]: '%${search}%' }` |

### Data Types
- **ObjectId** → **INTEGER PRIMARY KEY AUTO_INCREMENT**
- **String** → **STRING/TEXT**
- **Boolean** → **BOOLEAN**
- **Date** → **DATE**
- **Array** → **JSON**
- **Object** → **JSON**

## Testing

1. **Database Connection**: Check console for "✅ MySQL Database Connected & Synced"
2. **Super Admin Creation**: Verify "✅ Super Admin created successfully"
3. **API Endpoints**: Test all endpoints to ensure functionality

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Check MySQL server is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Table Creation Errors**:
   - Run `npm run init-db` to create tables
   - Check for syntax errors in model definitions

3. **Authentication Issues**:
   - Verify super admin was created
   - Check JWT secrets in `.env`

### Migration Commands

```bash
# Force recreate all tables (WARNING: Deletes all data)
npm run init-db -- --force

# Check database status
npm run init-db
```

## Benefits of Migration

1. **ACID Compliance**: Strong data consistency
2. **Complex Queries**: Better support for complex joins and aggregations
3. **Performance**: Optimized for structured data
4. **Scalability**: Better vertical scaling options
5. **Tooling**: Rich ecosystem of MySQL tools

## Rollback Plan

If rollback is needed:
1. Restore original MongoDB configuration
2. Revert models to Mongoose schemas
3. Update controllers back to Mongoose syntax
4. Restore `package.json` dependencies

## Support

For issues during migration:
1. Check MySQL logs: `/var/log/mysql/error.log`
2. Review application logs for detailed error messages
3. Verify all environment variables are correctly set
