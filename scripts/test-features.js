#!/usr/bin/env node

const request = require('supertest');
const app = require('../server/server');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!'
};

let authToken = null;
let userId = null;

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m', // Green
        error: '\x1b[31m',   // Red
        warning: '\x1b[33m'  // Yellow
    };
    console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
};

// Test functions
async function testAuthentication() {
    log('Testing Authentication...', 'info');
    
    try {
        // Test registration
        log('  Testing user registration...', 'info');
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(TEST_USER)
            .expect(201);
        
        authToken = registerResponse.body.token;
        userId = registerResponse.body.user.id;
        log('  ✓ User registration successful', 'success');
        
        // Test login
        log('  Testing user login...', 'info');
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: TEST_USER.email,
                password: TEST_USER.password
            })
            .expect(200);
        
        log('  ✓ User login successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Authentication test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testProfileManagement() {
    log('Testing Profile Management...', 'info');
    
    try {
        const profileData = {
            name: 'John Doe',
            age: 25,
            weight: 70.5,
            height: 175,
            goal: 'build-muscle',
            experience: 'intermediate',
            medical: 'None'
        };
        
        // Test profile update
        log('  Testing profile update...', 'info');
        await request(app)
            .put('/api/user/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send(profileData)
            .expect(200);
        
        log('  ✓ Profile update successful', 'success');
        
        // Test profile retrieval
        log('  Testing profile retrieval...', 'info');
        const profileResponse = await request(app)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Profile retrieval successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Profile management test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testWorkoutFeatures() {
    log('Testing Workout Features...', 'info');
    
    try {
        // Test AI workout generation
        log('  Testing AI workout generation...', 'info');
        const generateResponse = await request(app)
            .post('/api/workout/generate')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                fitnessGoals: ['strength', 'muscle'],
                experienceLevel: 'intermediate',
                workoutType: 'strength',
                duration: '45-60 min'
            })
            .expect(200);
        
        log('  ✓ AI workout generation successful', 'success');
        
        // Test workout logging
        log('  Testing workout logging...', 'info');
        const workoutData = {
            type: 'strength',
            exercises: [
                {
                    name: 'Push-ups',
                    sets: 3,
                    reps: '10-15',
                    weight: 0,
                    rest: '60s'
                },
                {
                    name: 'Squats',
                    sets: 4,
                    reps: '12-15',
                    weight: 0,
                    rest: '90s'
                }
            ],
            notes: 'Great workout session'
        };
        
        await request(app)
            .post('/api/workout')
            .set('Authorization', `Bearer ${authToken}`)
            .send(workoutData)
            .expect(201);
        
        log('  ✓ Workout logging successful', 'success');
        
        // Test workout retrieval
        log('  Testing workout retrieval...', 'info');
        await request(app)
            .get('/api/workout')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Workout retrieval successful', 'success');
        
        // Test workout statistics
        log('  Testing workout statistics...', 'info');
        await request(app)
            .get('/api/workout/stats')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Workout statistics successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Workout features test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testNutritionFeatures() {
    log('Testing Nutrition Features...', 'info');
    
    try {
        // Test nutrition logging
        log('  Testing nutrition logging...', 'info');
        const nutritionData = {
            date: new Date().toISOString().split('T')[0],
            meals: [
                {
                    name: 'Breakfast',
                    time: '08:00',
                    foods: [
                        { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3 },
                        { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 }
                    ]
                }
            ],
            waterIntake: 500
        };
        
        await request(app)
            .post('/api/nutrition')
            .set('Authorization', `Bearer ${authToken}`)
            .send(nutritionData)
            .expect(201);
        
        log('  ✓ Nutrition logging successful', 'success');
        
        // Test nutrition retrieval
        log('  Testing nutrition retrieval...', 'info');
        await request(app)
            .get('/api/nutrition')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Nutrition retrieval successful', 'success');
        
        // Test nutrition statistics
        log('  Testing nutrition statistics...', 'info');
        await request(app)
            .get('/api/nutrition/stats')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Nutrition statistics successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Nutrition features test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testHydrationFeatures() {
    log('Testing Hydration Features...', 'info');
    
    try {
        // Test hydration logging
        log('  Testing hydration logging...', 'info');
        const hydrationData = {
            date: new Date().toISOString().split('T')[0],
            amount: 500,
            unit: 'ml',
            type: 'water',
            notes: 'Morning hydration'
        };
        
        await request(app)
            .post('/api/hydration')
            .set('Authorization', `Bearer ${authToken}`)
            .send(hydrationData)
            .expect(201);
        
        log('  ✓ Hydration logging successful', 'success');
        
        // Test hydration retrieval
        log('  Testing hydration retrieval...', 'info');
        await request(app)
            .get('/api/hydration')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Hydration retrieval successful', 'success');
        
        // Test hydration statistics
        log('  Testing hydration statistics...', 'info');
        await request(app)
            .get('/api/hydration/stats')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Hydration statistics successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Hydration features test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testPainFatigueFeatures() {
    log('Testing Pain & Fatigue Features...', 'info');
    
    try {
        // Test pain/fatigue logging
        log('  Testing pain/fatigue logging...', 'info');
        const painData = {
            date: new Date().toISOString().split('T')[0],
            painLevel: 3,
            fatigueLevel: 4,
            affectedAreas: ['lower back', 'shoulders'],
            notes: 'Mild discomfort after workout'
        };
        
        await request(app)
            .post('/api/pain-fatigue')
            .set('Authorization', `Bearer ${authToken}`)
            .send(painData)
            .expect(201);
        
        log('  ✓ Pain/fatigue logging successful', 'success');
        
        // Test pain/fatigue retrieval
        log('  Testing pain/fatigue retrieval...', 'info');
        await request(app)
            .get('/api/pain-fatigue')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Pain/fatigue retrieval successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Pain/fatigue features test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testSchedulingFeatures() {
    log('Testing Scheduling Features...', 'info');
    
    try {
        // Test schedule creation
        log('  Testing schedule creation...', 'info');
        const scheduleData = {
            date: new Date().toISOString().split('T')[0],
            event: 'Morning Workout',
            time: '07:00',
            type: 'workout',
            duration: '60 min',
            notes: 'Morning strength training'
        };
        
        await request(app)
            .post('/api/scheduling')
            .set('Authorization', `Bearer ${authToken}`)
            .send(scheduleData)
            .expect(201);
        
        log('  ✓ Schedule creation successful', 'success');
        
        // Test schedule retrieval
        log('  Testing schedule retrieval...', 'info');
        await request(app)
            .get('/api/scheduling')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Schedule retrieval successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Scheduling features test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testHabitsFeatures() {
    log('Testing Habits Features...', 'info');
    
    try {
        // Test habit creation
        log('  Testing habit creation...', 'info');
        const habitData = {
            habit: 'Daily Exercise',
            frequency: 'daily',
            target: 1,
            unit: 'times',
            notes: 'Exercise for at least 30 minutes'
        };
        
        await request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${authToken}`)
            .send(habitData)
            .expect(201);
        
        log('  ✓ Habit creation successful', 'success');
        
        // Test habit retrieval
        log('  Testing habit retrieval...', 'info');
        await request(app)
            .get('/api/habits')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Habit retrieval successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Habits features test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testDataExport() {
    log('Testing Data Export...', 'info');
    
    try {
        // Test data export
        log('  Testing data export...', 'info');
        const exportResponse = await request(app)
            .get('/api/user/export')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        
        log('  ✓ Data export successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Data export test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testFrontendAccess() {
    log('Testing Frontend Access...', 'info');
    
    try {
        // Test main page access
        log('  Testing main page access...', 'info');
        await request(app)
            .get('/')
            .expect(200);
        
        log('  ✓ Main page access successful', 'success');
        
        // Test health endpoint
        log('  Testing health endpoint...', 'info');
        const healthResponse = await request(app)
            .get('/api/health')
            .expect(200);
        
        log('  ✓ Health endpoint successful', 'success');
        
        return true;
    } catch (error) {
        log(`  ✗ Frontend access test failed: ${error.message}`, 'error');
        return false;
    }
}

// Main test runner
async function runAllTests() {
    log('🚀 Starting Comprehensive Fitness App Testing...', 'info');
    log('', 'info');
    
    const results = {
        authentication: false,
        profile: false,
        workout: false,
        nutrition: false,
        hydration: false,
        painFatigue: false,
        scheduling: false,
        habits: false,
        dataExport: false,
        frontend: false
    };
    
    try {
        // Run tests in sequence
        results.authentication = await testAuthentication();
        if (!results.authentication) {
            log('❌ Authentication failed, stopping tests', 'error');
            return results;
        }
        
        await delay(1000); // Small delay between tests
        
        results.profile = await testProfileManagement();
        await delay(500);
        
        results.workout = await testWorkoutFeatures();
        await delay(500);
        
        results.nutrition = await testNutritionFeatures();
        await delay(500);
        
        results.hydration = await testHydrationFeatures();
        await delay(500);
        
        results.painFatigue = await testPainFatigueFeatures();
        await delay(500);
        
        results.scheduling = await testSchedulingFeatures();
        await delay(500);
        
        results.habits = await testHabitsFeatures();
        await delay(500);
        
        results.dataExport = await testDataExport();
        await delay(500);
        
        results.frontend = await testFrontendAccess();
        
    } catch (error) {
        log(`❌ Test runner error: ${error.message}`, 'error');
    }
    
    // Print summary
    log('', 'info');
    log('📊 Test Results Summary:', 'info');
    log('', 'info');
    
    const testNames = {
        authentication: 'Authentication',
        profile: 'Profile Management',
        workout: 'Workout Features',
        nutrition: 'Nutrition Features',
        hydration: 'Hydration Features',
        painFatigue: 'Pain & Fatigue Features',
        scheduling: 'Scheduling Features',
        habits: 'Habits Features',
        dataExport: 'Data Export',
        frontend: 'Frontend Access'
    };
    
    let passedTests = 0;
    let totalTests = Object.keys(results).length;
    
    Object.entries(results).forEach(([key, result]) => {
        const status = result ? '✓ PASS' : '✗ FAIL';
        const color = result ? 'success' : 'error';
        log(`  ${status} ${testNames[key]}`, color);
        if (result) passedTests++;
    });
    
    log('', 'info');
    log(`🎯 Overall Result: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'success' : 'warning');
    
    if (passedTests === totalTests) {
        log('🎉 All tests passed! The fitness app is working correctly.', 'success');
    } else {
        log('⚠️  Some tests failed. Please check the errors above.', 'warning');
    }
    
    return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            log(`❌ Test execution failed: ${error.message}`, 'error');
            process.exit(1);
        });
}

module.exports = {
    runAllTests,
    testAuthentication,
    testProfileManagement,
    testWorkoutFeatures,
    testNutritionFeatures,
    testHydrationFeatures,
    testPainFatigueFeatures,
    testSchedulingFeatures,
    testHabitsFeatures,
    testDataExport,
    testFrontendAccess
};
