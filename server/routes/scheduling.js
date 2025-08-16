const express = require('express');
const router = express.Router();

// Create schedule entry
router.post('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const { date, time, event, type, duration, notes } = req.body;

        // Validation
        if (!event || !date) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Event and date are required'
            });
        }

        const scheduleEntry = {
            id: Date.now().toString(),
            userId,
            date: date,
            time: time || '00:00',
            event: event.trim(),
            type: type || 'general',
            duration: duration || '60 min',
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

        userData.scheduling.push(scheduleEntry);
        req.userData.set(userId, userData);

        res.status(201).json({
            message: 'Schedule entry created successfully',
            entry: scheduleEntry
        });

    } catch (error) {
        console.error('Create schedule entry error:', error);
        res.status(500).json({ 
            error: 'Failed to create schedule entry',
            details: 'An error occurred while creating the schedule entry'
        });
    }
});

// Get all schedule entries
router.get('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate, type } = req.query;

        const userData = req.userData.get(userId);
        if (!userData || !userData.scheduling) {
            return res.json({ entries: [] });
        }

        let entries = [...userData.scheduling];

        // Filter by date range
        if (startDate && endDate) {
            entries = entries.filter(entry => 
                entry.date >= startDate && entry.date <= endDate
            );
        }

        // Filter by type
        if (type) {
            entries = entries.filter(entry => entry.type === type);
        }

        // Sort by date and time
        entries.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        res.json({ entries });

    } catch (error) {
        console.error('Get schedule entries error:', error);
        res.status(500).json({ 
            error: 'Failed to get schedule entries',
            details: 'An error occurred while retrieving schedule entries'
        });
    }
});

// Get specific schedule entry
router.get('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.scheduling) {
            return res.status(404).json({ 
                error: 'Schedule entry not found',
                details: 'The requested schedule entry could not be found'
            });
        }

        const entry = userData.scheduling.find(s => s.id === id);
        if (!entry) {
            return res.status(404).json({ 
                error: 'Schedule entry not found',
                details: 'The requested schedule entry could not be found'
            });
        }

        res.json({ entry });

    } catch (error) {
        console.error('Get schedule entry error:', error);
        res.status(500).json({ 
            error: 'Failed to get schedule entry',
            details: 'An error occurred while retrieving the schedule entry'
        });
    }
});

// Update schedule entry
router.put('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;

        const userData = req.userData.get(userId);
        if (!userData || !userData.scheduling) {
            return res.status(404).json({ 
                error: 'Schedule entry not found',
                details: 'The requested schedule entry could not be found'
            });
        }

        const entryIndex = userData.scheduling.findIndex(s => s.id === id);
        if (entryIndex === -1) {
            return res.status(404).json({ 
                error: 'Schedule entry not found',
                details: 'The requested schedule entry could not be found'
            });
        }

        // Update entry
        userData.scheduling[entryIndex] = {
            ...userData.scheduling[entryIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        req.userData.set(userId, userData);

        res.json({
            message: 'Schedule entry updated successfully',
            entry: userData.scheduling[entryIndex]
        });

    } catch (error) {
        console.error('Update schedule entry error:', error);
        res.status(500).json({ 
            error: 'Failed to update schedule entry',
            details: 'An error occurred while updating the schedule entry'
        });
    }
});

// Delete schedule entry
router.delete('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.scheduling) {
            return res.status(404).json({ 
                error: 'Schedule entry not found',
                details: 'The requested schedule entry could not be found'
            });
        }

        const entryIndex = userData.scheduling.findIndex(s => s.id === id);
        if (entryIndex === -1) {
            return res.status(404).json({ 
                error: 'Schedule entry not found',
                details: 'The requested schedule entry could not be found'
            });
        }

        userData.scheduling.splice(entryIndex, 1);
        req.userData.set(userId, userData);

        res.json({
            message: 'Schedule entry deleted successfully'
        });

    } catch (error) {
        console.error('Delete schedule entry error:', error);
        res.status(500).json({ 
            error: 'Failed to delete schedule entry',
            details: 'An error occurred while deleting the schedule entry'
        });
    }
});

// Get schedule statistics
router.get('/stats', (req, res) => {
    try {
        const userId = req.user.userId;

        const userData = req.userData.get(userId);
        if (!userData || !userData.scheduling || userData.scheduling.length === 0) {
            return res.json({
                stats: {
                    totalEntries: 0,
                    upcomingEvents: [],
                    eventTypes: {},
                    weeklySchedule: []
                }
            });
        }

        const entries = userData.scheduling;
        const totalEntries = entries.length;

        // Get upcoming events (next 7 days)
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        const upcomingEvents = entries
            .filter(entry => entry.date >= today && entry.date <= nextWeekStr)
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
            .slice(0, 10);

        // Count event types
        const eventTypes = {};
        entries.forEach(entry => {
            eventTypes[entry.type] = (eventTypes[entry.type] || 0) + 1;
        });

        // Get weekly schedule
        const weeklySchedule = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayEvents = entries.filter(entry => entry.date === dateStr);
            weeklySchedule.push({
                date: dateStr,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                events: dayEvents.length,
                eventsList: dayEvents
            });
        }

        const stats = {
            totalEntries,
            upcomingEvents,
            eventTypes,
            weeklySchedule
        };

        res.json({ stats });

    } catch (error) {
        console.error('Get schedule stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get schedule statistics',
            details: 'An error occurred while retrieving schedule statistics'
        });
    }
});

module.exports = router;
