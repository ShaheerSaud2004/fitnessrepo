const request = require('supertest');
const app = require('../../server/server');

// Import test setup
const { generateUniqueEmail } = require('../test-setup');

// Test data
const testUser = {
    email: generateUniqueEmail(),
    password: 'testpassword123',
    name: 'Test User'
};

const testHydrationEntry = {
    date: new Date().toISOString().split('T')[0],
    amount: 500,
    unit: 'ml',
    type: 'water',
    notes: 'Morning hydration'
};

describe('Hydration Routes - Unit Tests', () => {
    let server;
    let authToken;
    let userId;

    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(done);
    });

    beforeEach(async () => {
        // Register and login user
        const uniqueUser = {
            ...testUser,
            email: generateUniqueEmail()
        };

        const registerResponse = await request(server)
            .post('/api/auth/register')
            .send(uniqueUser);

        expect(registerResponse.status).toBe(201);
        authToken = registerResponse.body.token;
        userId = registerResponse.body.user.id;
    });

    describe('POST /api/hydration', () => {
        test('should create hydration entry successfully', async () => {
            const response = await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testHydrationEntry)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Hydration entry created successfully');
            expect(response.body).toHaveProperty('entry');
            expect(response.body.entry).toHaveProperty('id');
            expect(response.body.entry).toHaveProperty('date', testHydrationEntry.date);
            expect(response.body.entry).toHaveProperty('amount', testHydrationEntry.amount);
            expect(response.body.entry).toHaveProperty('unit', testHydrationEntry.unit);
            expect(response.body.entry).toHaveProperty('type', testHydrationEntry.type);
            expect(response.body.entry).toHaveProperty('notes', testHydrationEntry.notes);
            expect(response.body.entry).toHaveProperty('createdAt');
            expect(response.body.entry).toHaveProperty('userId', userId);
        });

        test('should create hydration entry with minimal data', async () => {
            const minimalEntry = {
                date: new Date().toISOString().split('T')[0],
                amount: 250,
                unit: 'ml'
            };

            const response = await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(minimalEntry)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Hydration entry created successfully');
            expect(response.body.entry).toHaveProperty('amount', 250);
            expect(response.body.entry).toHaveProperty('unit', 'ml');
        });

        test('should reject entry without required fields', async () => {
            const invalidEntry = {
                date: new Date().toISOString().split('T')[0],
                notes: 'Missing amount and unit'
            };

            const response = await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidEntry)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .post('/api/hydration')
                .send(testHydrationEntry)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/hydration', () => {
        beforeEach(async () => {
            // Create test hydration entries
            await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testHydrationEntry);

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayEntry = {
                ...testHydrationEntry,
                date: yesterday.toISOString().split('T')[0],
                amount: 750
            };

            await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(yesterdayEntry);
        });

        test('should get all hydration entries successfully', async () => {
            const response = await request(server)
                .get('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('entries');
            expect(Array.isArray(response.body.entries)).toBe(true);
            expect(response.body.entries.length).toBe(2);
            expect(response.body.entries[0]).toHaveProperty('id');
            expect(response.body.entries[0]).toHaveProperty('date');
            expect(response.body.entries[0]).toHaveProperty('amount');
        });

        test('should filter entries by date range', async () => {
            const today = new Date().toISOString().split('T')[0];
            const response = await request(server)
                .get(`/api/hydration?startDate=${today}&endDate=${today}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.entries.length).toBe(1);
            expect(response.body.entries[0]).toHaveProperty('date', today);
        });

        test('should filter entries by amount range', async () => {
            const response = await request(server)
                .get('/api/hydration?minAmount=600&maxAmount=800')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.entries.length).toBe(1);
            expect(response.body.entries[0]).toHaveProperty('amount', 750);
        });

        test('should return empty array when no entries exist', async () => {
            // Create a new user for this test to ensure no existing data
            const newUser = {
                email: generateUniqueEmail(),
                password: 'testpassword123',
                name: 'New User'
            };

            const registerResponse = await request(server)
                .post('/api/auth/register')
                .send(newUser);

            const newAuthToken = registerResponse.body.token;

            const response = await request(server)
                .get('/api/hydration')
                .set('Authorization', `Bearer ${newAuthToken}`)
                .expect(200);

            expect(response.body.entries).toEqual([]);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get('/api/hydration')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/hydration/:id', () => {
        let entryId;

        beforeEach(async () => {
            // Create a test hydration entry
            const response = await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testHydrationEntry);

            entryId = response.body.entry.id;
        });

        test('should get specific hydration entry successfully', async () => {
            const response = await request(server)
                .get(`/api/hydration/${entryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('entry');
            expect(response.body.entry).toHaveProperty('id', entryId);
            expect(response.body.entry).toHaveProperty('date', testHydrationEntry.date);
            expect(response.body.entry).toHaveProperty('amount', testHydrationEntry.amount);
        });

        test('should return 404 for non-existent entry', async () => {
            const response = await request(server)
                .get('/api/hydration/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Hydration entry not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get(`/api/hydration/${entryId}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('PUT /api/hydration/:id', () => {
        let entryId;

        beforeEach(async () => {
            // Create a test hydration entry
            const response = await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testHydrationEntry);

            entryId = response.body.entry.id;
        });

        test('should update hydration entry successfully', async () => {
            const updateData = {
                amount: 1000,
                notes: 'Updated hydration entry'
            };

            const response = await request(server)
                .put(`/api/hydration/${entryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Hydration entry updated successfully');
            expect(response.body).toHaveProperty('entry');
            expect(response.body.entry).toHaveProperty('amount', 1000);
            expect(response.body.entry).toHaveProperty('notes', 'Updated hydration entry');
            expect(response.body.entry).toHaveProperty('updatedAt');
        });

        test('should return 404 for non-existent entry', async () => {
            const response = await request(server)
                .put('/api/hydration/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ amount: 1000 })
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Hydration entry not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .put(`/api/hydration/${entryId}`)
                .send({ amount: 1000 })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('DELETE /api/hydration/:id', () => {
        let entryId;

        beforeEach(async () => {
            // Create a test hydration entry
            const response = await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testHydrationEntry);

            entryId = response.body.entry.id;
        });

        test('should delete hydration entry successfully', async () => {
            const response = await request(server)
                .delete(`/api/hydration/${entryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Hydration entry deleted successfully');
        });

        test('should return 404 for non-existent entry', async () => {
            const response = await request(server)
                .delete('/api/hydration/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Hydration entry not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .delete(`/api/hydration/${entryId}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/hydration/stats', () => {
        beforeEach(async () => {
            // Create hydration entries for different dates
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ...testHydrationEntry,
                    date: today.toISOString().split('T')[0],
                    amount: 2000
                });

            await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ...testHydrationEntry,
                    date: yesterday.toISOString().split('T')[0],
                    amount: 1800
                });
        });

        test('should get hydration statistics successfully', async () => {
            const response = await request(server)
                .get('/api/hydration/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveProperty('totalEntries', 2);
            expect(response.body.stats).toHaveProperty('totalAmount');
            expect(response.body.stats).toHaveProperty('averageAmount');
            expect(response.body.stats).toHaveProperty('dailyGoal');
            expect(response.body.stats).toHaveProperty('goalProgress');
        });

        test('should calculate average amount correctly', async () => {
            const response = await request(server)
                .get('/api/hydration/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Average of 2000 and 1800 = 1900
            expect(response.body.stats.averageAmount).toBe(1900);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get('/api/hydration/stats')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });
});
