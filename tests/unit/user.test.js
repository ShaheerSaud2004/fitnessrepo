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

const testProfile = {
    name: 'John Doe',
    age: 30,
    weight: 75.5,
    height: 180,
    fitnessGoals: ['strength', 'cardio'],
    medicalHistory: 'None',
    experienceLevel: 'intermediate'
};

const testSettings = {
    darkMode: true,
    units: 'imperial',
    notifications: false
};

describe('User Routes - Unit Tests', () => {
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

    describe('GET /api/user/profile', () => {
        test('should get user profile successfully', async () => {
            const response = await request(server)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('profile');
            expect(response.body).toHaveProperty('settings');
            expect(response.body.settings).toHaveProperty('darkMode', false);
            expect(response.body.settings).toHaveProperty('units', 'metric');
            expect(response.body.settings).toHaveProperty('notifications', true);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get('/api/user/profile')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('PUT /api/user/profile', () => {
        test('should update user profile successfully', async () => {
            const response = await request(server)
                .put('/api/user/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testProfile)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Profile updated successfully');
            expect(response.body).toHaveProperty('profile');
            expect(response.body.profile).toHaveProperty('name', testProfile.name);
            expect(response.body.profile).toHaveProperty('age', testProfile.age);
            expect(response.body.profile).toHaveProperty('weight', testProfile.weight);
            expect(response.body.profile).toHaveProperty('height', testProfile.height);
            expect(response.body.profile).toHaveProperty('fitnessGoals');
            expect(response.body.profile).toHaveProperty('medicalHistory', testProfile.medicalHistory);
            expect(response.body.profile).toHaveProperty('experienceLevel', testProfile.experienceLevel);
        });

        test('should update profile with partial data', async () => {
            const partialProfile = {
                name: 'Jane Doe',
                age: 25
            };

            const response = await request(server)
                .put('/api/user/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(partialProfile)
                .expect(200);

            expect(response.body.profile).toHaveProperty('name', 'Jane Doe');
            expect(response.body.profile).toHaveProperty('age', 25);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .put('/api/user/profile')
                .send(testProfile)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('PUT /api/user/settings', () => {
        test('should update user settings successfully', async () => {
            const response = await request(server)
                .put('/api/user/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testSettings)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Settings updated successfully');
            expect(response.body).toHaveProperty('settings');
            expect(response.body.settings).toHaveProperty('darkMode', testSettings.darkMode);
            expect(response.body.settings).toHaveProperty('units', testSettings.units);
            expect(response.body.settings).toHaveProperty('notifications', testSettings.notifications);
        });

        test('should update settings with partial data', async () => {
            const partialSettings = {
                darkMode: true
            };

            const response = await request(server)
                .put('/api/user/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send(partialSettings)
                .expect(200);

            expect(response.body.settings).toHaveProperty('darkMode', true);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .put('/api/user/settings')
                .send(testSettings)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('DELETE /api/user/account', () => {
        test('should delete user account successfully', async () => {
            const response = await request(server)
                .delete('/api/user/account')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Account deleted successfully');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .delete('/api/user/account')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/user/stats', () => {
        test('should get user statistics successfully', async () => {
            const response = await request(server)
                .get('/api/user/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveProperty('totalWorkouts', 0);
            expect(response.body.stats).toHaveProperty('totalNutritionEntries', 0);
            expect(response.body.stats).toHaveProperty('totalHydrationEntries', 0);
            expect(response.body.stats).toHaveProperty('totalPainFatigueEntries', 0);
            expect(response.body.stats).toHaveProperty('totalScheduledEvents', 0);
            expect(response.body.stats).toHaveProperty('totalHabits', 0);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get('/api/user/stats')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });
});
