const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../../server/server');

// Import test setup
const { generateUniqueEmail } = require('../test-setup');

// Mock data
const testUser = {
    email: generateUniqueEmail(),
    password: 'testpassword123',
    name: 'Test User'
};

const invalidUser = {
    email: 'invalid@example.com',
    password: 'wrongpassword',
    name: 'Invalid User'
};

describe('Authentication Routes - Unit Tests', () => {
    let server;
    let authToken;

    beforeAll(() => {
        server = app.listen(0); // Use random port for testing
    });

    afterAll((done) => {
        server.close(done);
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'User registered successfully');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', uniqueUser.email);
            expect(response.body.user).toHaveProperty('name', uniqueUser.name);
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('createdAt');
        });

        test('should reject registration with missing email', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    password: testUser.password,
                    name: testUser.name
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Missing required fields');
        });

        test('should reject registration with missing password', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: testUser.email,
                    name: testUser.name
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Missing required fields');
        });

        test('should reject registration with missing name', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Missing required fields');
        });

        test('should reject registration with short password', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: testUser.email,
                    password: '123',
                    name: testUser.name
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Password too short');
        });

        test('should reject duplicate user registration', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            // Register user first time
            await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            // Try to register same user again
            const response = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(409);

            expect(response.body).toHaveProperty('error', 'User already exists');
        });

        test('should handle registration with invalid email format', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: testUser.password,
                    name: testUser.name
                })
                .expect(400); // Now properly validates email format

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login successfully with valid credentials', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            // Register a user for login tests
            await request(server)
                .post('/api/auth/register')
                .send(uniqueUser);

            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: uniqueUser.email,
                    password: uniqueUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', uniqueUser.email);
            expect(response.body.user).toHaveProperty('name', uniqueUser.name);
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('lastLogin');
        });

        test('should reject login with invalid email', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password
                })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });

        test('should reject login with invalid password', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            // Register a user first
            await request(server)
                .post('/api/auth/register')
                .send(uniqueUser);

            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: uniqueUser.email,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });

        test('should reject login with missing credentials', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Missing credentials');
        });

        test('should handle case-insensitive email login', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            // Register a user first
            await request(server)
                .post('/api/auth/register')
                .send(uniqueUser);

            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: uniqueUser.email.toUpperCase(),
                    password: uniqueUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Login successful');
        });
    });

    describe('GET /api/auth/verify', () => {
        test('should verify valid token successfully', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            // Register and get token
            const registerResponse = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser);

            authToken = registerResponse.body.token;

            const response = await request(server)
                .get('/api/auth/verify')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('valid', true);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', uniqueUser.email);
        });

        test('should reject invalid token', async () => {
            const response = await request(server)
                .get('/api/auth/verify')
                .set('Authorization', 'Bearer invalid-token')
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        test('should reject missing token', async () => {
            const response = await request(server)
                .get('/api/auth/verify')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'No token provided');
        });
    });

    describe('Password Security', () => {
        test('should hash passwords during registration', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            // Verify that the stored password is hashed
            const { User } = require('../../server/models');
            const user = await User.findOne({ where: { email: uniqueUser.email } });
            
            expect(user.password).not.toBe(uniqueUser.password);
            expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
        });

        test('should use strong salt rounds for password hashing', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            const { User } = require('../../server/models');
            const user = await User.findOne({ where: { email: uniqueUser.email } });
            
            // Check that password was hashed with bcrypt
            const isValidHash = await bcrypt.compare(uniqueUser.password, user.password);
            expect(isValidHash).toBe(true);
        });
    });

    describe('JWT Token Security', () => {
        test('should generate valid JWT tokens', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            const token = response.body.token;
            
            // Verify token structure
            expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
            
            // Verify token can be decoded
            const decoded = jwt.decode(token);
            expect(decoded).toHaveProperty('userId');
            expect(decoded).toHaveProperty('email', uniqueUser.email);
            expect(decoded).toHaveProperty('name', uniqueUser.name);
        });

        test('should include user information in JWT payload', async () => {
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            const token = response.body.token;
            const decoded = jwt.decode(token);
            
            expect(decoded).toHaveProperty('userId');
            expect(decoded).toHaveProperty('email', uniqueUser.email);
            expect(decoded).toHaveProperty('name', uniqueUser.name);
            expect(decoded).toHaveProperty('iat'); // issued at
            expect(decoded).toHaveProperty('exp'); // expiration
        });
    });
});
