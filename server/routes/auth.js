const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Import database models
const { User, Profile, Settings } = require('../models');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Email, password, and name are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format',
                details: 'Please provide a valid email address'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password too short',
                details: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(409).json({ 
                error: 'User already exists',
                details: 'An account with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user in database
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name.trim()
        });

        // Create default profile
        await Profile.create({
            userId: user.id
        });

        // Create default settings
        await Settings.create({
            userId: user.id
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name 
            },
            req.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                error: 'Validation error',
                details: error.errors.map(e => e.message).join(', ')
            });
        }
        
        res.status(500).json({ 
            error: 'Registration failed',
            details: 'An error occurred during registration'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Missing credentials',
                details: 'Email and password are required'
            });
        }

        // Find user in database
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                details: 'Email or password is incorrect'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                details: 'Email or password is incorrect'
            });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name 
            },
            req.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed',
            details: 'An error occurred during login'
        });
    }
});

// Verify token
router.get('/verify', (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'No token provided',
                details: 'Authorization header is required'
            });
        }

        jwt.verify(token, req.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    error: 'Invalid token',
                    details: 'Token is invalid or expired'
                });
            }

            // Check if user still exists in database
            const user = await User.findByPk(decoded.userId);
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found',
                    details: 'User account no longer exists'
                });
            }

            res.json({
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    lastLogin: user.lastLogin
                }
            });
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ 
            error: 'Token verification failed',
            details: 'An error occurred during token verification'
        });
    }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return success
        res.json({
            message: 'Logout successful',
            details: 'Token should be removed from client storage'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            error: 'Logout failed',
            details: 'An error occurred during logout'
        });
    }
});

module.exports = router;
