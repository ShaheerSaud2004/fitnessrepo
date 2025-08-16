// Set test environment before importing models
process.env.NODE_ENV = 'test';

const { sequelize, initializeDatabase } = require('../server/models');

// Global test setup
beforeAll(async () => {
    try {
        // Initialize database with force sync only once
        const success = await initializeDatabase();
        if (!success) {
            throw new Error('Database initialization failed');
        }
        console.log('✅ Test database initialized');
    } catch (error) {
        console.error('❌ Test database initialization failed:', error);
        throw error;
    }
});

// Global test cleanup
afterAll(async () => {
    try {
        await sequelize.close();
        console.log('✅ Test database connection closed');
    } catch (error) {
        console.error('❌ Error closing test database:', error);
    }
});

// Clean up data between tests
beforeEach(async () => {
    try {
        // Disable foreign key constraints for cleanup
        await sequelize.query('PRAGMA foreign_keys = OFF');
        
        // Get all table names
        const tableNames = Object.keys(sequelize.models);
        
        // Clear all tables
        for (const tableName of tableNames) {
            try {
                await sequelize.query(`DELETE FROM ${tableName}`);
            } catch (error) {
                // Ignore errors for non-existent tables
            }
        }
        
        // Re-enable foreign key constraints
        await sequelize.query('PRAGMA foreign_keys = ON');
    } catch (error) {
        // Non-critical cleanup errors can be ignored
    }
});

// Helper function to generate unique emails for tests
const generateUniqueEmail = () => {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
};

module.exports = {
    sequelize,
    generateUniqueEmail
};
