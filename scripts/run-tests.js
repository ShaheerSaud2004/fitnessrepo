#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Test configuration
const testConfig = {
    unit: {
        pattern: 'tests/unit/**/*.test.js',
        description: 'Unit Tests'
    },
    integration: {
        pattern: 'tests/integration/**/*.test.js',
        description: 'Integration Tests'
    },
    all: {
        pattern: 'tests/**/*.test.js',
        description: 'All Tests'
    }
};

// Helper functions
function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
    log(`\n${'='.repeat(60)}`, colors.cyan);
    log(`  ${message}`, colors.bright + colors.cyan);
    log(`${'='.repeat(60)}`, colors.cyan);
}

function logSection(message) {
    log(`\n${'-'.repeat(40)}`, colors.blue);
    log(`  ${message}`, colors.bright + colors.blue);
    log(`${'-'.repeat(40)}`, colors.blue);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        type: 'all',
        watch: false,
        coverage: false,
        verbose: false,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--unit':
            case '-u':
                options.type = 'unit';
                break;
            case '--integration':
            case '-i':
                options.type = 'integration';
                break;
            case '--watch':
            case '-w':
                options.watch = true;
                break;
            case '--coverage':
            case '-c':
                options.coverage = true;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
            default:
                logWarning(`Unknown argument: ${arg}`);
        }
    }

    return options;
}

// Show help information
function showHelp() {
    logHeader('Fitness App Test Runner');
    log('\nUsage: node scripts/run-tests.js [options]', colors.bright);
    log('\nOptions:', colors.bright);
    log('  --unit, -u           Run unit tests only');
    log('  --integration, -i    Run integration tests only');
    log('  --watch, -w          Run tests in watch mode');
    log('  --coverage, -c       Generate coverage report');
    log('  --verbose, -v        Verbose output');
    log('  --help, -h           Show this help message');
    log('\nExamples:', colors.bright);
    log('  node scripts/run-tests.js                    # Run all tests');
    log('  node scripts/run-tests.js --unit             # Run unit tests only');
    log('  node scripts/run-tests.js --coverage         # Run with coverage');
    log('  node scripts/run-tests.js --watch --verbose  # Watch mode with verbose output');
    log('\nTest Types:', colors.bright);
    log('  Unit Tests:          Individual function and route testing');
    log('  Integration Tests:   End-to-end user journey testing');
    log('  All Tests:           Complete test suite');
}

// Check if dependencies are installed
function checkDependencies() {
    const packageJson = require('../package.json');
    const requiredDeps = ['jest', 'supertest'];
    const missingDeps = [];

    for (const dep of requiredDeps) {
        try {
            require.resolve(dep);
        } catch (e) {
            missingDeps.push(dep);
        }
    }

    if (missingDeps.length > 0) {
        logError(`Missing dependencies: ${missingDeps.join(', ')}`);
        logInfo('Run: npm install');
        process.exit(1);
    }
}

// Run Jest tests
function runJest(options) {
    return new Promise((resolve, reject) => {
        const config = testConfig[options.type];
        logSection(`Running ${config.description}`);

        const jestArgs = [
            '--testPathPattern', config.pattern,
            '--verbose'
        ];

        if (options.watch) {
            jestArgs.push('--watch');
        }

        if (options.coverage) {
            jestArgs.push('--coverage');
            jestArgs.push('--coverageReporters', 'text,lcov,html');
        }

        if (options.verbose) {
            jestArgs.push('--verbose');
        }

        logInfo(`Jest command: npx jest ${jestArgs.join(' ')}`);

        const jest = spawn('npx', ['jest', ...jestArgs], {
            stdio: 'inherit',
            shell: true
        });

        jest.on('close', (code) => {
            if (code === 0) {
                logSuccess(`${config.description} completed successfully`);
                resolve();
            } else {
                logError(`${config.description} failed with code ${code}`);
                reject(new Error(`Jest exited with code ${code}`));
            }
        });

        jest.on('error', (error) => {
            logError(`Failed to start Jest: ${error.message}`);
            reject(error);
        });
    });
}

// Generate test report
function generateReport(options) {
    const reportPath = path.join(__dirname, '..', 'test-report.json');
    const report = {
        timestamp: new Date().toISOString(),
        testType: options.type,
        options: options,
        summary: {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        }
    };

    // Try to read Jest results if coverage was enabled
    if (options.coverage) {
        const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
        if (fs.existsSync(coveragePath)) {
            try {
                const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
                report.coverage = coverage;
            } catch (error) {
                logWarning('Could not read coverage report');
            }
        }
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logInfo(`Test report saved to: ${reportPath}`);
}

// Performance testing
async function runPerformanceTests() {
    logSection('Running Performance Tests');
    
    const { performance } = require('perf_hooks');
    const request = require('supertest');
    const app = require('../server/server');

    const server = app.listen(0);
    const baseURL = `http://localhost:${server.address().port}`;

    try {
        // Test user registration performance
        const registrationTimes = [];
        for (let i = 0; i < 10; i++) {
            const start = performance.now();
            await request(server)
                .post('/api/auth/register')
                .send({
                    email: `perf-test-${i}@example.com`,
                    password: 'testpassword123',
                    name: `Perf User ${i}`
                });
            const end = performance.now();
            registrationTimes.push(end - start);
        }

        const avgRegistrationTime = registrationTimes.reduce((a, b) => a + b, 0) / registrationTimes.length;
        logSuccess(`Average registration time: ${avgRegistrationTime.toFixed(2)}ms`);

        // Test concurrent requests
        const concurrentStart = performance.now();
        const promises = Array(5).fill().map((_, i) => 
            request(server)
                .get('/api/health')
                .expect(200)
        );
        await Promise.all(promises);
        const concurrentEnd = performance.now();
        const concurrentTime = concurrentEnd - concurrentStart;

        logSuccess(`5 concurrent health checks: ${concurrentTime.toFixed(2)}ms`);

    } finally {
        server.close();
    }
}

// Security testing
async function runSecurityTests() {
    logSection('Running Security Tests');
    
    const request = require('supertest');
    const app = require('../server/server');

    const server = app.listen(0);

    try {
        // Test SQL injection protection (if applicable)
        const maliciousInputs = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "<script>alert('xss')</script>",
            "../../../etc/passwd"
        ];

        for (const input of maliciousInputs) {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: input,
                    password: 'test123',
                    name: input
                });

            // Should not crash the server
            expect(response.status).not.toBe(500);
        }

        logSuccess('Security tests passed');

    } finally {
        server.close();
    }
}

// Main function
async function main() {
    const options = parseArgs();

    if (options.help) {
        showHelp();
        return;
    }

    logHeader('Fitness App Test Suite');
    logInfo(`Test Type: ${options.type}`);
    logInfo(`Watch Mode: ${options.watch ? 'Yes' : 'No'}`);
    logInfo(`Coverage: ${options.coverage ? 'Yes' : 'No'}`);
    logInfo(`Verbose: ${options.verbose ? 'Yes' : 'No'}`);

    try {
        // Check dependencies
        checkDependencies();

        // Run tests
        await runJest(options);

        // Generate report
        generateReport(options);

        // Run additional tests if requested
        if (options.verbose) {
            await runPerformanceTests();
            await runSecurityTests();
        }

        logSuccess('All tests completed successfully!');

    } catch (error) {
        logError(`Test execution failed: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch((error) => {
        logError(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    runJest,
    generateReport,
    runPerformanceTests,
    runSecurityTests
};
