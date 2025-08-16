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

const testMeal = {
    meal: 'breakfast',
    foods: [
        {
            name: 'Oatmeal',
            quantity: 100,
            unit: 'g',
            calories: 389,
            protein: 13.5,
            carbs: 66.3,
            fat: 6.9,
            fiber: 10.6
        },
        {
            name: 'Banana',
            quantity: 1,
            unit: 'medium',
            calories: 105,
            protein: 1.3,
            carbs: 27.0,
            fat: 0.4,
            fiber: 3.1
        }
    ],
    totalCalories: 494,
    totalProtein: 14.8,
    totalCarbs: 93.3,
    totalFat: 7.3,
    totalFiber: 13.7,
    notes: 'Healthy breakfast'
};

const testNutritionEntry = {
    date: new Date().toISOString().split('T')[0],
    meals: [testMeal],
    totalCalories: 494,
    totalProtein: 14.8,
    totalCarbs: 93.3,
    totalFat: 7.3,
    totalFiber: 13.7,
    waterIntake: 500,
    notes: 'Good nutrition day'
};

describe('Nutrition Routes - Unit Tests', () => {
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

    describe('POST /api/nutrition', () => {
        test('should create nutrition entry successfully', async () => {
            const response = await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testNutritionEntry)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Nutrition entry created successfully');
            expect(response.body).toHaveProperty('entry');
            expect(response.body.entry).toHaveProperty('id');
            expect(response.body.entry).toHaveProperty('date', testNutritionEntry.date);
            expect(response.body.entry).toHaveProperty('meals');
            expect(response.body.entry).toHaveProperty('totalCalories', testNutritionEntry.totalCalories);
            expect(response.body.entry).toHaveProperty('totalProtein', testNutritionEntry.totalProtein);
            expect(response.body.entry).toHaveProperty('totalCarbs', testNutritionEntry.totalCarbs);
            expect(response.body.entry).toHaveProperty('totalFat', testNutritionEntry.totalFat);
            expect(response.body.entry).toHaveProperty('totalFiber', testNutritionEntry.totalFiber);
            expect(response.body.entry).toHaveProperty('waterIntake', testNutritionEntry.waterIntake);
            expect(response.body.entry).toHaveProperty('notes', testNutritionEntry.notes);
            expect(response.body.entry).toHaveProperty('createdAt');
            expect(response.body.entry).toHaveProperty('userId', userId);
        });

        test('should create nutrition entry with minimal data', async () => {
            const minimalEntry = {
                date: new Date().toISOString().split('T')[0],
                meals: [
                    {
                        meal: 'breakfast',
                        foods: [
                            {
                                name: 'Coffee',
                                calories: 5
                            }
                        ]
                    }
                ]
            };

            const response = await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(minimalEntry)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Nutrition entry created successfully');
            expect(response.body.entry).toHaveProperty('meals');
            expect(response.body.entry.meals).toHaveLength(1);
        });

        test('should reject entry without meals', async () => {
            const invalidEntry = {
                date: new Date().toISOString().split('T')[0],
                notes: 'No meals provided'
            };

            const response = await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidEntry)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .post('/api/nutrition')
                .send(testNutritionEntry)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/nutrition', () => {
        beforeEach(async () => {
            // Create test nutrition entries
            await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testNutritionEntry);

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayEntry = {
                ...testNutritionEntry,
                date: yesterday.toISOString().split('T')[0],
                totalCalories: 1200
            };

            await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(yesterdayEntry);
        });

        test('should get all nutrition entries successfully', async () => {
            const response = await request(server)
                .get('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('entries');
            expect(Array.isArray(response.body.entries)).toBe(true);
            expect(response.body.entries.length).toBe(2);
            expect(response.body.entries[0]).toHaveProperty('id');
            expect(response.body.entries[0]).toHaveProperty('date');
            expect(response.body.entries[0]).toHaveProperty('meals');
        });

        test('should filter entries by date range', async () => {
            const today = new Date().toISOString().split('T')[0];
            const response = await request(server)
                .get(`/api/nutrition?startDate=${today}&endDate=${today}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.entries.length).toBe(1);
            expect(response.body.entries[0]).toHaveProperty('date', today);
        });

        test('should filter entries by calorie range', async () => {
            const response = await request(server)
                .get('/api/nutrition?minCalories=1000&maxCalories=1500')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.entries.length).toBe(1);
            expect(response.body.entries[0]).toHaveProperty('totalCalories', 1200);
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
                .get('/api/nutrition')
                .set('Authorization', `Bearer ${newAuthToken}`)
                .expect(200);

            expect(response.body.entries).toEqual([]);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get('/api/nutrition')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/nutrition/:id', () => {
        let entryId;

        beforeEach(async () => {
            // Create a test nutrition entry
            const response = await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testNutritionEntry);

            entryId = response.body.entry.id;
        });

        test('should get specific nutrition entry successfully', async () => {
            const response = await request(server)
                .get(`/api/nutrition/${entryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('entry');
            expect(response.body.entry).toHaveProperty('id', entryId);
            expect(response.body.entry).toHaveProperty('date', testNutritionEntry.date);
            expect(response.body.entry).toHaveProperty('meals');
        });

        test('should return 404 for non-existent entry', async () => {
            const response = await request(server)
                .get('/api/nutrition/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Nutrition entry not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get(`/api/nutrition/${entryId}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('PUT /api/nutrition/:id', () => {
        let entryId;

        beforeEach(async () => {
            // Create a test nutrition entry
            const response = await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testNutritionEntry);

            entryId = response.body.entry.id;
        });

        test('should update nutrition entry successfully', async () => {
            const updateData = {
                totalCalories: 1500,
                notes: 'Updated nutrition entry'
            };

            const response = await request(server)
                .put(`/api/nutrition/${entryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Nutrition entry updated successfully');
            expect(response.body).toHaveProperty('entry');
            expect(response.body.entry).toHaveProperty('totalCalories', 1500);
            expect(response.body.entry).toHaveProperty('notes', 'Updated nutrition entry');
            expect(response.body.entry).toHaveProperty('updatedAt');
        });

        test('should return 404 for non-existent entry', async () => {
            const response = await request(server)
                .put('/api/nutrition/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ totalCalories: 1500 })
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Nutrition entry not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .put(`/api/nutrition/${entryId}`)
                .send({ totalCalories: 1500 })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('DELETE /api/nutrition/:id', () => {
        let entryId;

        beforeEach(async () => {
            // Create a test nutrition entry
            const response = await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testNutritionEntry);

            entryId = response.body.entry.id;
        });

        test('should delete nutrition entry successfully', async () => {
            const response = await request(server)
                .delete(`/api/nutrition/${entryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Nutrition entry deleted successfully');
        });

        test('should return 404 for non-existent entry', async () => {
            const response = await request(server)
                .delete('/api/nutrition/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Nutrition entry not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .delete(`/api/nutrition/${entryId}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/nutrition/stats', () => {
        beforeEach(async () => {
            // Create nutrition entries for different dates
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ...testNutritionEntry,
                    date: today.toISOString().split('T')[0],
                    totalCalories: 2000
                });

            await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ...testNutritionEntry,
                    date: yesterday.toISOString().split('T')[0],
                    totalCalories: 1800
                });
        });

        test('should get nutrition statistics successfully', async () => {
            const response = await request(server)
                .get('/api/nutrition/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveProperty('totalEntries', 2);
            expect(response.body.stats).toHaveProperty('averageCalories');
            expect(response.body.stats).toHaveProperty('averageProtein');
            expect(response.body.stats).toHaveProperty('averageCarbs');
            expect(response.body.stats).toHaveProperty('averageFat');
            expect(response.body.stats).toHaveProperty('dailyGoal');
            expect(response.body.stats).toHaveProperty('goalProgress');
        });

        test('should calculate average calories correctly', async () => {
            const response = await request(server)
                .get('/api/nutrition/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Average of 2000 and 1800 = 1900
            expect(response.body.stats.averageCalories).toBe(1900);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get('/api/nutrition/stats')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });
});
