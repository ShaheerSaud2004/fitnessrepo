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

const testWorkout = {
    type: 'strength',
    duration: '45 min',
    exercises: [
        {
            name: 'Push-ups',
            sets: 3,
            reps: '10-15',
            weight: null,
            rest: '60s',
            completed: false
        },
        {
            name: 'Squats',
            sets: 4,
            reps: '12-15',
            weight: null,
            rest: '90s',
            completed: false
        }
    ],
    notes: 'Great workout session',
    difficulty: 'beginner'
};

const aiWorkoutRequest = {
    fitnessGoals: ['strength', 'cardio'],
    experienceLevel: 'intermediate',
    medicalHistory: 'None',
    workoutType: 'strength',
    duration: '45-60 min'
};

describe('Workout Routes - Unit Tests', () => {
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

    describe('POST /api/workout/generate', () => {
        test('should generate AI workout successfully', async () => {
            const response = await request(server)
                .post('/api/workout/generate')
                .set('Authorization', `Bearer ${authToken}`)
                .send(aiWorkoutRequest)
                .expect(200);

            expect(response.body).toHaveProperty('workout');
            expect(response.body.workout).toHaveProperty('id');
            expect(response.body.workout).toHaveProperty('type', 'strength');
            expect(response.body.workout).toHaveProperty('duration', '45-60 min');
            expect(response.body.workout).toHaveProperty('exercises');
            expect(response.body.workout).toHaveProperty('difficulty', 'intermediate');
            expect(response.body.workout).toHaveProperty('createdAt');
            expect(Array.isArray(response.body.workout.exercises)).toBe(true);
            expect(response.body.workout.exercises.length).toBeGreaterThan(0);
        });

        test('should generate workout with default values when minimal data provided', async () => {
            const response = await request(server)
                .post('/api/workout/generate')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(200);

            expect(response.body).toHaveProperty('workout');
            expect(response.body.workout).toHaveProperty('type', 'strength');
            expect(response.body.workout).toHaveProperty('duration', '45-60 min');
            expect(response.body.workout).toHaveProperty('difficulty', 'beginner');
            expect(response.body.workout).toHaveProperty('exercises');
        });

        test('should generate cardio workout when cardio goals specified', async () => {
            const cardioRequest = {
                ...aiWorkoutRequest,
                workoutType: 'cardio',
                fitnessGoals: ['cardio', 'endurance']
            };

            const response = await request(server)
                .post('/api/workout/generate')
                .set('Authorization', `Bearer ${authToken}`)
                .send(cardioRequest)
                .expect(200);

            expect(response.body.workout).toHaveProperty('type', 'cardio');
            expect(response.body.workout.exercises.some(ex => 
                ex.name.toLowerCase().includes('run') || 
                ex.name.toLowerCase().includes('jog') ||
                ex.name.toLowerCase().includes('bike') ||
                ex.name.toLowerCase().includes('swim')
            )).toBe(true);
        });

        test('should generate flexibility workout when flexibility goals specified', async () => {
            const flexibilityRequest = {
                ...aiWorkoutRequest,
                workoutType: 'flexibility',
                fitnessGoals: ['flexibility', 'mobility']
            };

            const response = await request(server)
                .post('/api/workout/generate')
                .set('Authorization', `Bearer ${authToken}`)
                .send(flexibilityRequest)
                .expect(200);

            expect(response.body.workout).toHaveProperty('type', 'flexibility');
            expect(response.body.workout.exercises.some(ex => 
                ex.name.toLowerCase().includes('stretch') || 
                ex.name.toLowerCase().includes('yoga') ||
                ex.name.toLowerCase().includes('flexibility')
            )).toBe(true);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .post('/api/workout/generate')
                .send(aiWorkoutRequest)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('POST /api/workout', () => {
        test('should create new workout successfully', async () => {
            const response = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testWorkout)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Workout created successfully');
            expect(response.body).toHaveProperty('workout');
            expect(response.body.workout).toHaveProperty('id');
            expect(response.body.workout).toHaveProperty('type', testWorkout.type);
            expect(response.body.workout).toHaveProperty('duration', testWorkout.duration);
            expect(response.body.workout).toHaveProperty('exercises');
            expect(response.body.workout).toHaveProperty('notes', testWorkout.notes);
            expect(response.body.workout).toHaveProperty('difficulty', testWorkout.difficulty);
            expect(response.body.workout).toHaveProperty('createdAt');
            expect(response.body.workout).toHaveProperty('userId', userId);
        });

        test('should create workout with minimal data', async () => {
            const minimalWorkout = {
                type: 'strength',
                exercises: [
                    {
                        name: 'Push-ups',
                        sets: 3,
                        reps: '10'
                    }
                ]
            };

            const response = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(minimalWorkout)
                .expect(201);

            expect(response.body.workout).toHaveProperty('type', 'strength');
            expect(response.body.workout.exercises).toHaveLength(1);
        });

        test('should reject workout without exercises', async () => {
            const invalidWorkout = {
                type: 'strength',
                duration: '30 min',
                notes: 'No exercises provided'
            };

            const response = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidWorkout)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .post('/api/workout')
                .send(testWorkout)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/workout', () => {
        beforeEach(async () => {
            // Create test workouts
            await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testWorkout);

            const cardioWorkout = {
                ...testWorkout,
                type: 'cardio',
                exercises: [
                    {
                        name: 'Running',
                        duration: '30 min',
                        intensity: 'moderate',
                        completed: false
                    }
                ]
            };

            await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(cardioWorkout);
        });

        test('should get all workouts successfully', async () => {
            const response = await request(server)
                .get('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('workouts');
            expect(Array.isArray(response.body.workouts)).toBe(true);
            expect(response.body.workouts.length).toBe(2);
            expect(response.body.workouts[0]).toHaveProperty('id');
            expect(response.body.workouts[0]).toHaveProperty('type');
            expect(response.body.workouts[0]).toHaveProperty('exercises');
        });

        test('should filter workouts by type', async () => {
            const response = await request(server)
                .get('/api/workout?type=strength')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.workouts.length).toBe(1);
            expect(response.body.workouts[0]).toHaveProperty('type', 'strength');
        });

        test('should filter workouts by date range', async () => {
            const today = new Date().toISOString().split('T')[0];
            const response = await request(server)
                .get(`/api/workout?startDate=${today}&endDate=${today}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.workouts.length).toBe(2);
        });

        test('should return empty array when no workouts exist', async () => {
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
                .get('/api/workout')
                .set('Authorization', `Bearer ${newAuthToken}`)
                .expect(200);

            expect(response.body.workouts).toEqual([]);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get('/api/workout')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/workout/:id', () => {
        let workoutId;

        beforeEach(async () => {
            // Create a test workout
            const response = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testWorkout);

            workoutId = response.body.workout.id;
        });

        test('should get specific workout successfully', async () => {
            const response = await request(server)
                .get(`/api/workout/${workoutId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('workout');
            expect(response.body.workout).toHaveProperty('id', workoutId);
            expect(response.body.workout).toHaveProperty('type', testWorkout.type);
            expect(response.body.workout).toHaveProperty('exercises');
        });

        test('should return 404 for non-existent workout', async () => {
            const response = await request(server)
                .get('/api/workout/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Workout not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get(`/api/workout/${workoutId}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('PUT /api/workout/:id', () => {
        let workoutId;

        beforeEach(async () => {
            // Create a test workout
            const response = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testWorkout);

            workoutId = response.body.workout.id;
        });

        test('should update workout successfully', async () => {
            const updateData = {
                notes: 'Updated workout notes',
                difficulty: 'intermediate'
            };

            const response = await request(server)
                .put(`/api/workout/${workoutId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Workout updated successfully');
            expect(response.body).toHaveProperty('workout');
            expect(response.body.workout).toHaveProperty('notes', 'Updated workout notes');
            expect(response.body.workout).toHaveProperty('difficulty', 'intermediate');
            expect(response.body.workout).toHaveProperty('updatedAt');
        });

        test('should return 404 for non-existent workout', async () => {
            const response = await request(server)
                .put('/api/workout/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ notes: 'Updated' })
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Workout not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .put(`/api/workout/${workoutId}`)
                .send({ notes: 'Updated' })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('DELETE /api/workout/:id', () => {
        let workoutId;

        beforeEach(async () => {
            // Create a test workout
            const response = await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testWorkout);

            workoutId = response.body.workout.id;
        });

        test('should delete workout successfully', async () => {
            const response = await request(server)
                .delete(`/api/workout/${workoutId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Workout deleted successfully');
        });

        test('should return 404 for non-existent workout', async () => {
            const response = await request(server)
                .delete('/api/workout/nonexistent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Workout not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .delete(`/api/workout/${workoutId}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });

    describe('GET /api/workout/stats', () => {
        beforeEach(async () => {
            // Create workouts of different types
            await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testWorkout);

            const cardioWorkout = {
                ...testWorkout,
                type: 'cardio',
                exercises: [
                    {
                        name: 'Running',
                        duration: '30 min',
                        intensity: 'moderate',
                        completed: false
                    }
                ]
            };

            await request(server)
                .post('/api/workout')
                .set('Authorization', `Bearer ${authToken}`)
                .send(cardioWorkout);
        });

        test('should get workout statistics successfully', async () => {
            const response = await request(server)
                .get('/api/workout/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveProperty('totalWorkouts', 2);
            expect(response.body.stats).toHaveProperty('workoutTypes');
            expect(response.body.stats).toHaveProperty('averageDuration');
            expect(response.body.stats).toHaveProperty('favoriteType');
        });

        test('should calculate workout types correctly', async () => {
            const response = await request(server)
                .get('/api/workout/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.stats.workoutTypes).toHaveProperty('strength', 1);
            expect(response.body.stats.workoutTypes).toHaveProperty('cardio', 1);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(server)
                .get('/api/workout/stats')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Access token required');
        });
    });
});
