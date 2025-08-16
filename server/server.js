const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database initialization
const { initializeDatabase } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const workoutRoutes = require('./routes/workout');
const nutritionRoutes = require('./routes/nutrition');
const hydrationRoutes = require('./routes/hydration');
const painFatigueRoutes = require('./routes/painFatigue');
const schedulingRoutes = require('./routes/scheduling');
const habitsRoutes = require('./routes/habits');

const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize app.locals for data storage (accessible to routes)
app.locals.users = new Map();
app.locals.userData = new Map();

// Middleware to make JWT_SECRET available to routes
app.use((req, res, next) => {
    req.JWT_SECRET = JWT_SECRET;
    req.users = app.locals.users;
    req.userData = app.locals.userData;
    next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/workout', authenticateToken, workoutRoutes);
app.use('/api/nutrition', authenticateToken, nutritionRoutes);
app.use('/api/hydration', authenticateToken, hydrationRoutes);
app.use('/api/pain-fatigue', authenticateToken, painFatigueRoutes);
app.use('/api/scheduling', authenticateToken, schedulingRoutes);
app.use('/api/habits', authenticateToken, habitsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle all other routes by serving the main app (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Validation Error', 
            details: err.message 
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            details: err.message 
        });
    }
    
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Only start the server if this file is run directly (not when imported for testing)
if (require.main === module) {
    // Initialize database before starting server
    initializeDatabase().then((success) => {
        if (success) {
            app.listen(PORT, () => {
                console.log(`🚀 Fitness Tracker server running on port ${PORT}`);
                console.log(`📱 Access the app at: http://localhost:${PORT}`);
                console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`💾 Database: SQLite (fitness.db)`);
            });
        } else {
            console.error('❌ Failed to initialize database. Server not started.');
            process.exit(1);
        }
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
