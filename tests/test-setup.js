// Test setup and utilities for the fitness app

const { sequelize, initializeDatabase } = require('../server/models');

// Initialize database before all tests
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Test database initialized');
});

// Clean up database after all tests
afterAll(async () => {
    await sequelize.close();
    console.log('✅ Test database connection closed');
});

// Clean up database between tests
beforeEach(async () => {
    try {
        // Get all table names
        const tableNames = Object.keys(sequelize.models);
        
        // Disable foreign key constraints temporarily
        await sequelize.query('PRAGMA foreign_keys = OFF');
        
        // Clear all tables that exist
        for (const tableName of tableNames) {
            try {
                await sequelize.query(`DELETE FROM ${tableName}`);
            } catch (error) {
                // Table might not exist yet, which is fine
                // console.log(`Table ${tableName} not found, skipping cleanup`);
            }
        }
        
        // Re-enable foreign key constraints
        await sequelize.query('PRAGMA foreign_keys = ON');
    } catch (error) {
        // console.log('Database cleanup error (non-critical):', error.message);
    }
});

// Helper function to generate unique test emails
const generateUniqueEmail = () => {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
};

module.exports = {
    sequelize,
    generateUniqueEmail
};
