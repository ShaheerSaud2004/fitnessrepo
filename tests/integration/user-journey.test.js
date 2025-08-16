const request = require('supertest');
const app = require('../../server/server');

// Import test setup
const { generateUniqueEmail } = require('../test-setup');

describe('Complete User Journey - Integration Tests', () => {
    let server;
    let authToken;
    let userId;

    const testUser = {
        email: generateUniqueEmail(),
        password: 'journey123456',
        name: 'Journey User'
    };

    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(done);
    });

    describe('Complete User Journey', () => {
        test('should complete full user journey from registration to data export', async () => {
            // Step 1: User Registration
            console.log('Step 1: User Registration');
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const registerResponse = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            expect(registerResponse.body).toHaveProperty('token');
            expect(registerResponse.body).toHaveProperty('user');
            expect(registerResponse.body.user).toHaveProperty('email', uniqueUser.email);
            expect(registerResponse.body.user).toHaveProperty('name', uniqueUser.name);

            authToken = registerResponse.body.token;
            userId = registerResponse.body.user.id;

            // Step 2: User Login
            console.log('Step 2: User Login');
            const loginResponse = await request(server)
                .post('/api/auth/login')
                .send({
                    email: uniqueUser.email,
                    password: uniqueUser.password
                })
                .expect(200);

            expect(loginResponse.body).toHaveProperty('token');
            expect(loginResponse.body).toHaveProperty('message', 'Login successful');

            // Step 3: Update User Profile
            console.log('Step 3: Update User Profile');
            const profileData = {
                name: 'Updated Journey User',
                age: 28,
                weight: 70,
                height: 175,
                fitnessGoals: ['strength', 'cardio', 'flexibility'],
                medicalHistory: 'None',
                experienceLevel: 'intermediate'
            };

            const profileResponse = await request(server)
                .put('/api/user/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)
                .expect(200);

            expect(profileResponse.body).toHaveProperty('message', 'Profile updated successfully');
            expect(profileResponse.body.profile).toHaveProperty('name', profileData.name);

            // Step 4: Update User Settings
            console.log('Step 4: Update User Settings');
            const settingsData = {
                darkMode: true,
                units: 'metric',
                notifications: true
            };

            const settingsResponse = await request(server)
                .put('/api/user/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send(settingsData)
                .expect(200);

            expect(settingsResponse.body).toHaveProperty('message', 'Settings updated successfully');
            expect(settingsResponse.body.settings).toHaveProperty('darkMode', true);

            // Step 5: Generate AI Workout
            console.log('Step 5: Generate AI Workout');
            const workoutRequest = {
                fitnessGoals: ['strength', 'cardio'],
                experienceLevel: 'intermediate',
                medicalHistory: 'None',
                workoutType: 'strength',
                duration: '45-60 min'
            };

            const workoutResponse = await request(server)
                .post('/api/workout/generate')
                .set('Authorization', `Bearer ${authToken}`)
                .send(workoutRequest)
                .expect(200);

            expect(workoutResponse.body).toHaveProperty('workout');
            expect(workoutResponse.body.workout).toHaveProperty('type', 'strength');
            expect(workoutResponse.body.workout).toHaveProperty('exercises');

            // Step 6: Create Manual Workout
            console.log('Step 6: Create Manual Workout');
            const manualWorkout = {
                type: 'cardio',
                duration: '30 min',
                exercises: [
                    {
                        name: 'Running',
                        duration: '30 min',
                        intensity: 'moderate',
                        completed: false
                    }
                ],
                notes: 'Morning cardio session',
                difficulty: 'beginner'
            };

            const manualWorkoutResponse = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(manualWorkout)
                .expect(201);

            expect(manualWorkoutResponse.body).toHaveProperty('message', 'Workout created successfully');
            expect(manualWorkoutResponse.body.workout).toHaveProperty('type', 'cardio');

            // Step 7: Create Nutrition Entry
            console.log('Step 7: Create Nutrition Entry');
            const nutritionEntry = {
                date: new Date().toISOString().split('T')[0],
                meals: [
                    {
                        meal: 'breakfast',
                        foods: [
                            {
                                name: 'Oatmeal',
                                calories: 150,
                                protein: 5,
                                carbs: 25,
                                fat: 3
                            }
                        ]
                    }
                ],
                totalCalories: 150,
                totalProtein: 5,
                totalCarbs: 25,
                totalFat: 3,
                notes: 'Healthy breakfast'
            };

            const nutritionResponse = await request(server)
                .post('/api/nutrition')
                .set('Authorization', `Bearer ${authToken}`)
                .send(nutritionEntry)
                .expect(201);

            expect(nutritionResponse.body).toHaveProperty('message', 'Nutrition entry created successfully');
            expect(nutritionResponse.body.entry).toHaveProperty('totalCalories', 150);

            // Step 8: Create Hydration Entry
            console.log('Step 8: Create Hydration Entry');
            const hydrationEntry = {
                date: new Date().toISOString().split('T')[0],
                amount: 500,
                unit: 'ml',
                type: 'water',
                notes: 'Morning hydration'
            };

            const hydrationResponse = await request(server)
                .post('/api/hydration')
                .set('Authorization', `Bearer ${authToken}`)
                .send(hydrationEntry)
                .expect(201);

            expect(hydrationResponse.body).toHaveProperty('message', 'Hydration entry created successfully');
            expect(hydrationResponse.body.entry).toHaveProperty('amount', 500);

            // Step 9: Create Pain/Fatigue Entry
            console.log('Step 9: Create Pain/Fatigue Entry');
            const painFatigueEntry = {
                date: new Date().toISOString().split('T')[0],
                painLevel: 2,
                fatigueLevel: 3,
                bodyAreas: ['shoulders'],
                notes: 'Slight shoulder discomfort'
            };

            const painFatigueResponse = await request(server)
                .post('/api/pain-fatigue')
                .set('Authorization', `Bearer ${authToken}`)
                .send(painFatigueEntry)
                .expect(201);

            expect(painFatigueResponse.body).toHaveProperty('message', 'Pain/fatigue entry created successfully');
            expect(painFatigueResponse.body.entry).toHaveProperty('painLevel', 2);

            // Step 10: Create Schedule Entry
            console.log('Step 10: Create Schedule Entry');
            const scheduleEntry = {
                date: new Date().toISOString().split('T')[0],
                time: '18:00',
                event: 'Evening Workout',
                type: 'workout',
                duration: '60 min',
                notes: 'Strength training session'
            };

            const scheduleResponse = await request(server)
                .post('/api/scheduling')
                .set('Authorization', `Bearer ${authToken}`)
                .send(scheduleEntry)
                .expect(201);

            expect(scheduleResponse.body).toHaveProperty('message', 'Schedule entry created successfully');
            expect(scheduleResponse.body.entry).toHaveProperty('event', 'Evening Workout');

            // Step 11: Create Habit Entry
            console.log('Step 11: Create Habit Entry');
            const habitEntry = {
                habit: 'Drink Water',
                frequency: 'daily',
                target: 8,
                unit: 'glasses',
                notes: 'Stay hydrated throughout the day'
            };

            const habitResponse = await request(server)
                .post('/api/habits')
                .set('Authorization', `Bearer ${authToken}`)
                .send(habitEntry)
                .expect(201);

            expect(habitResponse.body).toHaveProperty('message', 'Habit created successfully');
            expect(habitResponse.body.habit).toHaveProperty('habit', 'Drink Water');

            // Step 12: Get User Statistics
            console.log('Step 12: Get User Statistics');
            const statsResponse = await request(server)
                .get('/api/user/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(statsResponse.body).toHaveProperty('stats');
            expect(statsResponse.body.stats).toHaveProperty('totalWorkouts', 1);
            expect(statsResponse.body.stats).toHaveProperty('totalNutritionEntries', 1);
            expect(statsResponse.body.stats).toHaveProperty('totalHydrationEntries', 1);
            expect(statsResponse.body.stats).toHaveProperty('totalPainFatigueEntries', 1);
            expect(statsResponse.body.stats).toHaveProperty('totalScheduledEvents', 1);
            expect(statsResponse.body.stats).toHaveProperty('totalHabits', 1);

            console.log('✅ Complete user journey test passed successfully!');
        });

        test('should handle concurrent user operations', async () => {
            // Register user
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const registerResponse = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            authToken = registerResponse.body.token;

            // Perform concurrent operations
            const concurrentOperations = [
                // Create workout
                request(server)
                    .post('/api/workout')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        type: 'strength',
                        exercises: [{ name: 'Push-ups', sets: 3, reps: '10' }]
                    }),
                
                // Create nutrition entry
                request(server)
                    .post('/api/nutrition')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        date: new Date().toISOString().split('T')[0],
                        meals: [{
                            meal: 'breakfast',
                            foods: [{ name: 'Coffee', calories: 5 }]
                        }]
                    }),
                
                // Create hydration entry
                request(server)
                    .post('/api/hydration')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        date: new Date().toISOString().split('T')[0],
                        amount: 500,
                        unit: 'ml'
                    })
            ];

            const results = await Promise.all(concurrentOperations);
            
            // All operations should succeed
            results.forEach(result => {
                expect(result.status).toBe(201);
            });

            console.log('✅ Concurrent operations test passed successfully!');
        });

        test('should handle data persistence across sessions', async () => {
            // Register user and create data
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const registerResponse = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            authToken = registerResponse.body.token;

            // Create a workout
            const workoutResponse = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'strength',
                    exercises: [{ name: 'Squats', sets: 3, reps: '12' }]
                })
                .expect(201);

            const workoutId = workoutResponse.body.workout.id;

            // Verify data persists by retrieving it
            const getWorkoutResponse = await request(server)
                .get(`/api/workout/${workoutId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(getWorkoutResponse.body.workout).toHaveProperty('id', workoutId);
            expect(getWorkoutResponse.body.workout).toHaveProperty('type', 'strength');

            console.log('✅ Data persistence test passed successfully!');
        });

        test('should handle error scenarios gracefully', async () => {
            // Register user
            const uniqueUser = {
                ...testUser,
                email: generateUniqueEmail()
            };

            const registerResponse = await request(server)
                .post('/api/auth/register')
                .send(uniqueUser)
                .expect(201);

            authToken = registerResponse.body.token;

            // Test invalid workout creation
            const invalidWorkoutResponse = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'strength',
                    // Missing required exercises
                })
                .expect(400);

            expect(invalidWorkoutResponse.body).toHaveProperty('error');

            // Test accessing non-existent resource
            const notFoundResponse = await request(server)
                .get('/api/workout/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(notFoundResponse.body).toHaveProperty('error', 'Workout not found');

            // Test unauthorized access
            const unauthorizedResponse = await request(server)
                .get('/api/workout')
                .expect(401);

            expect(unauthorizedResponse.body).toHaveProperty('error', 'Access token required');

            console.log('✅ Error handling test passed successfully!');
        });
    });
});
