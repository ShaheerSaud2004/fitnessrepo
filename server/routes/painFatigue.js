const express = require('express');
const router = express.Router();

// Create pain/fatigue entry
router.post('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const { date, painLevel, fatigueLevel, bodyAreas, notes } = req.body;

        // Validation
        if (painLevel === undefined || painLevel < 0 || painLevel > 10) {
            return res.status(400).json({ 
                error: 'Invalid pain level',
                details: 'Pain level must be between 0 and 10'
            });
        }

        if (fatigueLevel === undefined || fatigueLevel < 0 || fatigueLevel > 10) {
            return res.status(400).json({ 
                error: 'Invalid fatigue level',
                details: 'Fatigue level must be between 0 and 10'
            });
        }

        const painFatigueEntry = {
            id: Date.now().toString(),
            userId,
            date: date || new Date().toISOString().split('T')[0],
            painLevel: parseInt(painLevel),
            fatigueLevel: parseInt(fatigueLevel),
            bodyAreas: bodyAreas || [],
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

        userData.painFatigue.push(painFatigueEntry);
        req.userData.set(userId, userData);

        res.status(201).json({
            message: 'Pain/fatigue entry created successfully',
            entry: painFatigueEntry
        });

    } catch (error) {
        console.error('Create pain/fatigue entry error:', error);
        res.status(500).json({ 
            error: 'Failed to create pain/fatigue entry',
            details: 'An error occurred while creating the pain/fatigue entry'
        });
    }
});

// Get all pain/fatigue entries
router.get('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate, minPainLevel, maxPainLevel } = req.query;

        const userData = req.userData.get(userId);
        if (!userData || !userData.painFatigue) {
            return res.json({ entries: [] });
        }

        let entries = [...userData.painFatigue];

        // Filter by date range
        if (startDate && endDate) {
            entries = entries.filter(entry => 
                entry.date >= startDate && entry.date <= endDate
            );
        }

        // Filter by pain level range
        if (minPainLevel || maxPainLevel) {
            entries = entries.filter(entry => {
                const painLevel = entry.painLevel || 0;
                if (minPainLevel && painLevel < parseInt(minPainLevel)) return false;
                if (maxPainLevel && painLevel > parseInt(maxPainLevel)) return false;
                return true;
            });
        }

        // Sort by date (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ entries });

    } catch (error) {
        console.error('Get pain/fatigue entries error:', error);
        res.status(500).json({ 
            error: 'Failed to get pain/fatigue entries',
            details: 'An error occurred while retrieving pain/fatigue entries'
        });
    }
});

// Get specific pain/fatigue entry
router.get('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.painFatigue) {
            return res.status(404).json({ 
                error: 'Pain/fatigue entry not found',
                details: 'The requested pain/fatigue entry could not be found'
            });
        }

        const entry = userData.painFatigue.find(p => p.id === id);
        if (!entry) {
            return res.status(404).json({ 
                error: 'Pain/fatigue entry not found',
                details: 'The requested pain/fatigue entry could not be found'
            });
        }

        res.json({ entry });

    } catch (error) {
        console.error('Get pain/fatigue entry error:', error);
        res.status(500).json({ 
            error: 'Failed to get pain/fatigue entry',
            details: 'An error occurred while retrieving the pain/fatigue entry'
        });
    }
});

// Update pain/fatigue entry
router.put('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;

        const userData = req.userData.get(userId);
        if (!userData || !userData.painFatigue) {
            return res.status(404).json({ 
                error: 'Pain/fatigue entry not found',
                details: 'The requested pain/fatigue entry could not be found'
            });
        }

        const entryIndex = userData.painFatigue.findIndex(p => p.id === id);
        if (entryIndex === -1) {
            return res.status(404).json({ 
                error: 'Pain/fatigue entry not found',
                details: 'The requested pain/fatigue entry could not be found'
            });
        }

        // Update entry
        userData.painFatigue[entryIndex] = {
            ...userData.painFatigue[entryIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        req.userData.set(userId, userData);

        res.json({
            message: 'Pain/fatigue entry updated successfully',
            entry: userData.painFatigue[entryIndex]
        });

    } catch (error) {
        console.error('Update pain/fatigue entry error:', error);
        res.status(500).json({ 
            error: 'Failed to update pain/fatigue entry',
            details: 'An error occurred while updating the pain/fatigue entry'
        });
    }
});

// Delete pain/fatigue entry
router.delete('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.painFatigue) {
            return res.status(404).json({ 
                error: 'Pain/fatigue entry not found',
                details: 'The requested pain/fatigue entry could not be found'
            });
        }

        const entryIndex = userData.painFatigue.findIndex(p => p.id === id);
        if (entryIndex === -1) {
            return res.status(404).json({ 
                error: 'Pain/fatigue entry not found',
                details: 'The requested pain/fatigue entry could not be found'
            });
        }

        userData.painFatigue.splice(entryIndex, 1);
        req.userData.set(userId, userData);

        res.json({
            message: 'Pain/fatigue entry deleted successfully'
        });

    } catch (error) {
        console.error('Delete pain/fatigue entry error:', error);
        res.status(500).json({ 
            error: 'Failed to delete pain/fatigue entry',
            details: 'An error occurred while deleting the pain/fatigue entry'
        });
    }
});

// Get pain/fatigue statistics
router.get('/stats', (req, res) => {
    try {
        const userId = req.user.userId;

        const userData = req.userData.get(userId);
        if (!userData || !userData.painFatigue || userData.painFatigue.length === 0) {
            return res.json({
                stats: {
                    totalEntries: 0,
                    averagePainLevel: 0,
                    averageFatigueLevel: 0,
                    mostCommonBodyAreas: [],
                    painTrend: [],
                    fatigueTrend: []
                }
            });
        }

        const entries = userData.painFatigue;
        const totalEntries = entries.length;
        const totalPainLevel = entries.reduce((sum, entry) => sum + (entry.painLevel || 0), 0);
        const totalFatigueLevel = entries.reduce((sum, entry) => sum + (entry.fatigueLevel || 0), 0);

        // Calculate most common body areas
        const bodyAreaCounts = {};
        entries.forEach(entry => {
            if (entry.bodyAreas && Array.isArray(entry.bodyAreas)) {
                entry.bodyAreas.forEach(area => {
                    bodyAreaCounts[area] = (bodyAreaCounts[area] || 0) + 1;
                });
            }
        });

        const mostCommonBodyAreas = Object.entries(bodyAreaCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([area, count]) => ({ area, count }));

        const stats = {
            totalEntries,
            averagePainLevel: Math.round(totalPainLevel / totalEntries),
            averageFatigueLevel: Math.round(totalFatigueLevel / totalEntries),
            mostCommonBodyAreas,
            painTrend: entries.slice(-7).map(entry => ({
                date: entry.date,
                painLevel: entry.painLevel
            })),
            fatigueTrend: entries.slice(-7).map(entry => ({
                date: entry.date,
                fatigueLevel: entry.fatigueLevel
            }))
        };

        res.json({ stats });

    } catch (error) {
        console.error('Get pain/fatigue stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get pain/fatigue statistics',
            details: 'An error occurred while retrieving pain/fatigue statistics'
        });
    }
});

module.exports = router;
