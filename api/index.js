const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database initialization
const { initializeDatabase } = require('../server/models');

// Import routes
const authRoutes = require('../server/routes/auth');
const userRoutes = require('../server/routes/user');
const workoutRoutes = require('../server/routes/workout');
const nutritionRoutes = require('../server/routes/nutrition');
const hydrationRoutes = require('../server/routes/hydration');
const painFatigueRoutes = require('../server/routes/painFatigue');
const schedulingRoutes = require('../server/routes/scheduling');
const habitsRoutes = require('../server/routes/habits');

const app = express();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://fitness-tracker-fhup53wvr-shaheers-projects-02efc33d.vercel.app',
            'https://fitness-tracker-ten-sigma.vercel.app',
            'https://*.vercel.app'
          ] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to make JWT_SECRET available to routes
app.use((req, res, next) => {
    req.JWT_SECRET = JWT_SECRET;
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
app.use('/auth', authRoutes);
app.use('/user', authenticateToken, userRoutes);
app.use('/workout', authenticateToken, workoutRoutes);
app.use('/nutrition', authenticateToken, nutritionRoutes);
app.use('/hydration', authenticateToken, hydrationRoutes);
app.use('/pain-fatigue', authenticateToken, painFatigueRoutes);
app.use('/scheduling', authenticateToken, schedulingRoutes);
app.use('/habits', authenticateToken, habitsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
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
    
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Initialize database
initializeDatabase().then(() => {
    console.log('✅ Database initialized for API');
}).catch(err => {
    console.error('❌ Database initialization failed:', err);
});

module.exports = app;
