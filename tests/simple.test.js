const { initializeDatabase, User } = require('../server/models');

describe('Database Setup', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initializeDatabase();
    });

    test('should create a user', async () => {
        const user = await User.create({
            email: 'test@example.com',
            password: 'hashedpassword',
            name: 'Test User'
        });
        
        expect(user.id).toBeDefined();
        expect(user.email).toBe('test@example.com');
    });
});
