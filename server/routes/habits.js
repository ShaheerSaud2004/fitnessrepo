const express = require('express');
const router = express.Router();

// Create habit entry
router.post('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const { habit, frequency, target, unit, notes } = req.body;

        // Validation
        if (!habit) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Habit name is required'
            });
        }

        const habitEntry = {
            id: Date.now().toString(),
            userId,
            habit: habit.trim(),
            frequency: frequency || 'daily',
            target: target || 1,
            unit: unit || 'times',
            notes: notes || '',
            createdAt: new Date().toISOString()
        };

        // Get or create user data
        let userData = req.userData.get(userId);
        if (!userData) {
            userData = {
                profile: {},
                workouts: [],
                nutrition: [],
                hydration: [],
                painFatigue: [],
                scheduling: [],
                habits: [],
                settings: {
                    darkMode: false,
                    units: 'metric',
                    notifications: true
                }
            };
        }

        userData.habits.push(habitEntry);
        req.userData.set(userId, userData);

        res.status(201).json({
            message: 'Habit created successfully',
            habit: habitEntry
        });

    } catch (error) {
        console.error('Create habit error:', error);
        res.status(500).json({ 
            error: 'Failed to create habit',
            details: 'An error occurred while creating the habit'
        });
    }
});

// Get all habits
router.get('/', (req, res) => {
    try {
        const userId = req.user.userId;

        const userData = req.userData.get(userId);
        if (!userData || !userData.habits) {
            return res.json({ habits: [] });
        }

        const habits = [...userData.habits];

        // Sort by creation date (newest first)
        habits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ habits });

    } catch (error) {
        console.error('Get habits error:', error);
        res.status(500).json({ 
            error: 'Failed to get habits',
            details: 'An error occurred while retrieving habits'
        });
    }
});

// Get specific habit
router.get('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.habits) {
            return res.status(404).json({ 
                error: 'Habit not found',
                details: 'The requested habit could not be found'
            });
        }

        const habit = userData.habits.find(h => h.id === id);
        if (!habit) {
            return res.status(404).json({ 
                error: 'Habit not found',
                details: 'The requested habit could not be found'
            });
        }

        res.json({ habit });

    } catch (error) {
        console.error('Get habit error:', error);
        res.status(500).json({ 
            error: 'Failed to get habit',
            details: 'An error occurred while retrieving the habit'
        });
    }
});

// Update habit
router.put('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;

        const userData = req.userData.get(userId);
        if (!userData || !userData.habits) {
            return res.status(404).json({ 
                error: 'Habit not found',
                details: 'The requested habit could not be found'
            });
        }

        const habitIndex = userData.habits.findIndex(h => h.id === id);
        if (habitIndex === -1) {
            return res.status(404).json({ 
                error: 'Habit not found',
                details: 'The requested habit could not be found'
            });
        }

        // Update habit
        userData.habits[habitIndex] = {
            ...userData.habits[habitIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        req.userData.set(userId, userData);

        res.json({
            message: 'Habit updated successfully',
            habit: userData.habits[habitIndex]
        });

    } catch (error) {
        console.error('Update habit error:', error);
        res.status(500).json({ 
            error: 'Failed to update habit',
            details: 'An error occurred while updating the habit'
        });
    }
});

// Delete habit
router.delete('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.habits) {
            return res.status(404).json({ 
                error: 'Habit not found',
                details: 'The requested habit could not be found'
            });
        }

        const habitIndex = userData.habits.findIndex(h => h.id === id);
        if (habitIndex === -1) {
            return res.status(404).json({ 
                error: 'Habit not found',
                details: 'The requested habit could not be found'
            });
        }

        userData.habits.splice(habitIndex, 1);
        req.userData.set(userId, userData);

        res.json({
            message: 'Habit deleted successfully'
        });

    } catch (error) {
        console.error('Delete habit error:', error);
        res.status(500).json({ 
            error: 'Failed to delete habit',
            details: 'An error occurred while deleting the habit'
        });
    }
});

// Get habit statistics
router.get('/stats', (req, res) => {
    try {
        const userId = req.user.userId;

        const userData = req.userData.get(userId);
        if (!userData || !userData.habits || userData.habits.length === 0) {
            return res.json({
                stats: {
                    totalHabits: 0,
                    activeHabits: 0,
                    habitTypes: {},
                    completionRate: 0
                }
            });
        }

        const habits = userData.habits;
        const totalHabits = habits.length;
        const activeHabits = habits.filter(habit => !habit.completed).length;

        // Count habits by frequency
        const habitTypes = {};
        habits.forEach(habit => {
            habitTypes[habit.frequency] = (habitTypes[habit.frequency] || 0) + 1;
        });

        // Calculate completion rate (simplified - would need tracking data in real app)
        const completionRate = Math.round((activeHabits / totalHabits) * 100);

        const stats = {
            totalHabits,
            activeHabits,
            habitTypes,
            completionRate
        };

        res.json({ stats });

    } catch (error) {
        console.error('Get habit stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get habit statistics',
            details: 'An error occurred while retrieving habit statistics'
        });
    }
});

module.exports = router;
