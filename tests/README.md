# Fitness App Test Suite

This directory contains comprehensive tests for the Fitness App to ensure all functionality works correctly for users.

## 🧪 Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── auth.test.js        # Authentication tests
│   ├── user.test.js        # User profile and settings tests
│   ├── workout.test.js     # Workout functionality tests
│   ├── nutrition.test.js   # Nutrition tracking tests
│   └── hydration.test.js   # Hydration tracking tests
├── integration/            # Integration tests for complete user journeys
│   └── user-journey.test.js # End-to-end user experience tests
├── test-setup.js          # Test utilities and configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage report
npm run test:coverage
```

### Using the Test Runner Script
```bash
# Run all tests
node scripts/run-tests.js

# Run unit tests only
node scripts/run-tests.js --unit

# Run with coverage
node scripts/run-tests.js --coverage

# Watch mode for development
node scripts/run-tests.js --watch

# Verbose output with performance tests
node scripts/run-tests.js --verbose
```

## 📋 Test Coverage

### Authentication Tests (`auth.test.js`)
- ✅ User registration with validation
- ✅ User login with credential verification
- ✅ JWT token generation and verification
- ✅ Password hashing and security
- ✅ Token expiration handling
- ✅ Logout functionality
- ✅ Error handling for invalid inputs

### User Profile Tests (`user.test.js`)
- ✅ Profile creation and updates
- ✅ BMI calculation
- ✅ Settings management (dark mode, units, notifications)
- ✅ Data export/import functionality
- ✅ User statistics calculation
- ✅ Data persistence across sessions

### Workout Tests (`workout.test.js`)
- ✅ AI workout generation
- ✅ Custom workout creation
- ✅ Exercise tracking and completion
- ✅ Workout history and filtering
- ✅ Workout statistics and analytics
- ✅ CRUD operations for workouts

### Nutrition Tests (`nutrition.test.js`)
- ✅ Meal tracking and logging
- ✅ Calorie and macro calculation
- ✅ Nutrition history and filtering
- ✅ Nutrition analysis and recommendations
- ✅ Water intake tracking

### Hydration Tests (`hydration.test.js`)
- ✅ Water intake logging
- ✅ Hydration goal tracking
- ✅ Daily/weekly statistics
- ✅ Progress visualization

### Integration Tests (`user-journey.test.js`)
- ✅ Complete user journey from registration to data export
- ✅ Concurrent user operations
- ✅ Data persistence across sessions
- ✅ Error scenario handling
- ✅ Performance under load

## 🛠️ Test Utilities

The `test-setup.js` file provides utilities for:

### Data Generation
```javascript
const testUtils = require('./test-setup');

// Generate test data
const user = testUtils.generateTestUser();
const workout = testUtils.generateTestWorkout();
const nutrition = testUtils.generateTestNutrition();
```

### Validation Helpers
```javascript
// Validate responses
expect(response.body).toBeValidJWT();
expect(response.body.date).toBeValidDate();
expect(response.body.email).toBeValidEmail();
```

### Performance Testing
```javascript
// Measure performance
const results = await testUtils.measurePerformance(async () => {
    // Your test function
}, 100);

// Load testing
const loadResults = await testUtils.loadTest(async () => {
    // Your API call
}, 10, 5000);
```

## 🔧 Test Configuration

### Jest Configuration
The Jest configuration is defined in `package.json`:

```json
{
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "server/**/*.js",
      "!server/server.js",
      "!**/node_modules/**"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"]
  }
}
```

### Environment Variables
Tests run in a clean environment with:
- `NODE_ENV=test`
- Isolated test data storage
- Mock console output (unless verbose mode)

## 📊 Coverage Reports

When running tests with coverage, reports are generated in:
- **Text**: Console output
- **HTML**: `coverage/index.html` (open in browser)
- **LCOV**: `coverage/lcov.info` (for CI/CD)

## 🚨 Error Handling

Tests verify proper error handling for:
- Invalid authentication tokens
- Missing required fields
- Malformed data
- Server errors
- Network timeouts

## 🔒 Security Testing

Security tests verify:
- Password hashing strength
- JWT token security
- Input validation
- SQL injection protection
- XSS prevention

## ⚡ Performance Testing

Performance tests measure:
- API response times
- Concurrent request handling
- Memory usage
- Database query performance

## 🧹 Test Data Management

- Each test runs with clean data
- Test data is isolated between tests
- No test affects another test's data
- Automatic cleanup after each test

## 📝 Writing New Tests

### Unit Test Template
```javascript
const request = require('supertest');
const app = require('../../server/server');

describe('Feature Name - Unit Tests', () => {
    let server;
    let authToken;

    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(done);
    });

    beforeEach(async () => {
        // Setup test data
        const response = await request(server)
            .post('/api/auth/register')
            .send(testUser);
        authToken = response.body.token;
    });

    test('should perform expected action', async () => {
        const response = await request(server)
            .post('/api/endpoint')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testData)
            .expect(201);

        expect(response.body).toHaveProperty('expectedField');
    });
});
```

### Integration Test Template
```javascript
describe('Complete Feature Journey', () => {
    test('should complete full user journey', async () => {
        // Step 1: Setup
        // Step 2: Action
        // Step 3: Verification
        // Step 4: Cleanup
    });
});
```

## 🐛 Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Specific Test
```bash
npm test -- --testNamePattern="should register user"
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📈 Continuous Integration

Tests are designed to run in CI/CD environments:
- No external dependencies
- Fast execution
- Reliable results
- Clear error reporting

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain test coverage above 80%
4. Update this README if needed

## 📞 Support

If you encounter test issues:
1. Check the test logs for specific errors
2. Verify all dependencies are installed
3. Ensure the server is not running on the test port
4. Check for environment variable conflicts
