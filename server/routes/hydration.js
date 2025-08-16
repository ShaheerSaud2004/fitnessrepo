const express = require('express');
const router = express.Router();

// Import database models
const { Hydration } = require('../models');

// Create hydration entry
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date, amount, unit, type, notes } = req.body;

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                error: 'Invalid amount',
                details: 'Amount must be greater than 0'
            });
        }

        if (!unit) {
            return res.status(400).json({ 
                error: 'Unit required',
                details: 'Please specify the unit of measurement'
            });
        }

        // Create hydration entry in database
        const hydrationEntry = await Hydration.create({
            userId,
            date: date || new Date().toISOString().split('T')[0],
            amount: parseFloat(amount),
            unit: unit,
            type: type || 'water',
            notes: notes || ''
        });

        res.status(201).json({
            message: 'Hydration entry created successfully',
            entry: hydrationEntry
        });

    } catch (error) {
        console.error('Create hydration entry error:', error);
        res.status(500).json({ 
            error: 'Failed to create hydration entry',
            details: 'An error occurred while creating the hydration entry'
        });
    }
});

// Get all hydration entries
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate, minAmount, maxAmount } = req.query;

        // Build where clause
        const whereClause = { userId };
        if (startDate && endDate) {
            whereClause.date = {
                [require('sequelize').Op.between]: [startDate, endDate]
            };
        }

        // Get entries from database
        let entries = await Hydration.findAll({
            where: whereClause,
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });

        // Filter by amount range if needed
        if (minAmount || maxAmount) {
            entries = entries.filter(entry => {
                const amount = entry.amount || 0;
                if (minAmount && amount < parseFloat(minAmount)) return false;
                if (maxAmount && amount > parseFloat(maxAmount)) return false;
                return true;
            });
        }

        res.json({ entries });

    } catch (error) {
        console.error('Get hydration entries error:', error);
        res.status(500).json({ 
            error: 'Failed to get hydration entries',
            details: 'An error occurred while retrieving hydration entries'
        });
    }
});

// Get hydration statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get entries from database
        const entries = await Hydration.findAll({
            where: { userId },
            order: [['date', 'DESC']]
        });

        if (entries.length === 0) {
            return res.json({
                stats: {
                    totalEntries: 0,
                    totalAmount: 0,
                    averageAmount: 0,
                    dailyGoal: 2000,
                    goalProgress: 0
                }
            });
        }

        const totalEntries = entries.length;
        const totalAmount = entries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);
        const averageAmount = Math.round(totalAmount / totalEntries);
        const dailyGoal = 2000; // Default daily goal in ml
        const goalProgress = Math.round((averageAmount / dailyGoal) * 100);

        const stats = {
            totalEntries,
            totalAmount,
            averageAmount,
            dailyGoal,
            goalProgress
        };

        res.json({ stats });

    } catch (error) {
        console.error('Get hydration stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get hydration statistics',
            details: 'An error occurred while retrieving hydration statistics'
        });
    }
});

// Get specific hydration entry
router.get('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.hydration) {
            return res.status(404).json({ 
                error: 'Hydration entry not found',
                details: 'The requested hydration entry could not be found'
            });
        }

        const entry = userData.hydration.find(h => h.id === id);
        if (!entry) {
            return res.status(404).json({ 
                error: 'Hydration entry not found',
                details: 'The requested hydration entry could not be found'
            });
        }

        res.json({ entry });

    } catch (error) {
        console.error('Get hydration entry error:', error);
        res.status(500).json({ 
            error: 'Failed to get hydration entry',
            details: 'An error occurred while retrieving the hydration entry'
        });
    }
});

// Update hydration entry
router.put('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;

        const userData = req.userData.get(userId);
        if (!userData || !userData.hydration) {
            return res.status(404).json({ 
                error: 'Hydration entry not found',
                details: 'The requested hydration entry could not be found'
            });
        }

        const entryIndex = userData.hydration.findIndex(h => h.id === id);
        if (entryIndex === -1) {
            return res.status(404).json({ 
                error: 'Hydration entry not found',
                details: 'The requested hydration entry could not be found'
            });
        }

        // Update entry
        userData.hydration[entryIndex] = {
            ...userData.hydration[entryIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        req.userData.set(userId, userData);

        res.json({
            message: 'Hydration entry updated successfully',
            entry: userData.hydration[entryIndex]
        });

    } catch (error) {
        console.error('Update hydration entry error:', error);
        res.status(500).json({ 
            error: 'Failed to update hydration entry',
            details: 'An error occurred while updating the hydration entry'
        });
    }
});

// Delete hydration entry
router.delete('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.hydration) {
            return res.status(404).json({ 
                error: 'Hydration entry not found',
                details: 'The requested hydration entry could not be found'
            });
        }

        const entryIndex = userData.hydration.findIndex(h => h.id === id);
        if (entryIndex === -1) {
            return res.status(404).json({ 
                error: 'Hydration entry not found',
                details: 'The requested hydration entry could not be found'
            });
        }

        userData.hydration.splice(entryIndex, 1);
        req.userData.set(userId, userData);

        res.json({
            message: 'Hydration entry deleted successfully'
        });

    } catch (error) {
        console.error('Delete hydration entry error:', error);
        res.status(500).json({ 
            error: 'Failed to delete hydration entry',
            details: 'An error occurred while deleting the hydration entry'
        });
    }
});

module.exports = router;
