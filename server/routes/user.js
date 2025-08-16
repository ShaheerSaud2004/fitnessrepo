const express = require('express');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
    try {
        const userId = req.user.userId;
        const userData = req.userData.get(userId);

        if (!userData) {
            return res.status(404).json({ 
                error: 'User data not found',
                details: 'User profile data could not be retrieved'
            });
        }

        res.json({
            profile: userData.profile || {},
            settings: userData.settings || {
                darkMode: false,
                units: 'metric',
                notifications: true
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            error: 'Failed to get profile',
            details: 'An error occurred while retrieving profile data'
        });
    }
});

// Update user profile
router.put('/profile', (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, age, weight, height, fitnessGoals, medicalHistory, experienceLevel } = req.body;

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

        // Update profile data
        userData.profile = {
            ...userData.profile,
            name: name || userData.profile.name,
            age: age !== undefined ? (isNaN(parseInt(age)) ? NaN : parseInt(age)) : userData.profile.age,
            weight: weight !== undefined ? (isNaN(parseFloat(weight)) ? NaN : parseFloat(weight)) : userData.profile.weight,
            height: height !== undefined ? (isNaN(parseFloat(height)) ? NaN : parseFloat(height)) : userData.profile.height,
            fitnessGoals: fitnessGoals || userData.profile.fitnessGoals,
            medicalHistory: medicalHistory || userData.profile.medicalHistory,
            experienceLevel: experienceLevel || userData.profile.experienceLevel,
            updatedAt: new Date().toISOString()
        };

        // Calculate BMI if weight and height are provided
        if (userData.profile.weight && userData.profile.height) {
            const heightInMeters = userData.profile.height / 100;
            userData.profile.bmi = (userData.profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
        }

        req.userData.set(userId, userData);

        res.json({
            message: 'Profile updated successfully',
            profile: userData.profile
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            error: 'Failed to update profile',
            details: 'An error occurred while updating profile data'
        });
    }
});

// Get user settings
router.get('/settings', (req, res) => {
    try {
        const userId = req.user.userId;
        const userData = req.userData.get(userId);

        if (!userData) {
            return res.status(404).json({ 
                error: 'User data not found',
                details: 'User settings could not be retrieved'
            });
        }

        res.json({
            settings: userData.settings || {
                darkMode: false,
                units: 'metric',
                notifications: true
            }
        });

    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ 
            error: 'Failed to get settings',
            details: 'An error occurred while retrieving settings'
        });
    }
});

// Update user settings
router.put('/settings', (req, res) => {
    try {
        const userId = req.user.userId;
        const { darkMode, units, notifications } = req.body;

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

        // Update settings
        userData.settings = {
            ...userData.settings,
            darkMode: darkMode !== undefined ? darkMode : userData.settings.darkMode,
            units: units || userData.settings.units,
            notifications: notifications !== undefined ? notifications : userData.settings.notifications,
            updatedAt: new Date().toISOString()
        };

        req.userData.set(userId, userData);

        res.json({
            message: 'Settings updated successfully',
            settings: userData.settings
        });

    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ 
            error: 'Failed to update settings',
            details: 'An error occurred while updating settings'
        });
    }
});

// Export all user data
router.get('/export', (req, res) => {
    try {
        const userId = req.user.userId;
        const userData = req.userData.get(userId);

        if (!userData) {
            return res.status(404).json({ 
                error: 'User data not found',
                details: 'No data available for export'
            });
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            user: {
                id: userId,
                email: req.user.email,
                name: req.user.name
            },
            data: userData
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="fitness-data-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(exportData);

    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ 
            error: 'Failed to export data',
            details: 'An error occurred while exporting user data'
        });
    }
});

// Import user data
router.post('/import', (req, res) => {
    try {
        const userId = req.user.userId;
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ 
                error: 'No data provided',
                details: 'Import data is required'
            });
        }

        // Validate data structure
        const requiredSections = ['profile', 'workouts', 'nutrition', 'hydration', 'painFatigue', 'scheduling', 'habits', 'settings'];
        const hasValidStructure = requiredSections.every(section => data.hasOwnProperty(section));

        if (!hasValidStructure) {
            return res.status(400).json({ 
                error: 'Invalid data format',
                details: 'Import data must contain all required sections'
            });
        }

        // Merge with existing data (don't overwrite completely)
        let existingData = req.userData.get(userId) || {
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

        // Merge data, preferring imported data
        const mergedData = {
            profile: { ...existingData.profile, ...data.profile },
            workouts: [...(data.workouts || []), ...(existingData.workouts || [])],
            nutrition: [...(data.nutrition || []), ...(existingData.nutrition || [])],
            hydration: [...(data.hydration || []), ...(existingData.hydration || [])],
            painFatigue: [...(data.painFatigue || []), ...(existingData.painFatigue || [])],
            scheduling: [...(data.scheduling || []), ...(existingData.scheduling || [])],
            habits: [...(data.habits || []), ...(existingData.habits || [])],
            settings: { ...existingData.settings, ...data.settings },
            importedAt: new Date().toISOString()
        };

        req.userData.set(userId, mergedData);

        res.json({
            message: 'Data imported successfully',
            importedSections: Object.keys(data),
            totalRecords: {
                workouts: mergedData.workouts.length,
                nutrition: mergedData.nutrition.length,
                hydration: mergedData.hydration.length,
                painFatigue: mergedData.painFatigue.length,
                scheduling: mergedData.scheduling.length,
                habits: mergedData.habits.length
            }
        });

    } catch (error) {
        console.error('Import data error:', error);
        res.status(500).json({ 
            error: 'Failed to import data',
            details: 'An error occurred while importing user data'
        });
    }
});

// Clear all user data
router.delete('/data', (req, res) => {
    try {
        const userId = req.user.userId;

        // Reset to default state
        const defaultData = {
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
            },
            clearedAt: new Date().toISOString()
        };

        req.userData.set(userId, defaultData);

        res.json({
            message: 'All data cleared successfully',
            details: 'User data has been reset to default state'
        });

    } catch (error) {
        console.error('Clear data error:', error);
        res.status(500).json({ 
            error: 'Failed to clear data',
            details: 'An error occurred while clearing user data'
        });
    }
});

// Get user statistics
router.get('/stats', (req, res) => {
    try {
        const userId = req.user.userId;
        const userData = req.userData.get(userId);

        if (!userData) {
            return res.status(404).json({ 
                error: 'User data not found',
                details: 'No statistics available'
            });
        }

        const stats = {
            totalWorkouts: userData.workouts?.length || 0,
            totalNutritionEntries: userData.nutrition?.length || 0,
            totalHydrationEntries: userData.hydration?.length || 0,
            totalPainFatigueEntries: userData.painFatigue?.length || 0,
            totalScheduledEvents: userData.scheduling?.length || 0,
            totalHabits: userData.habits?.length || 0,
            profileComplete: !!(userData.profile?.name && userData.profile?.age),
            lastActivity: null
        };

        // Find last activity across all modules
        const allActivities = [
            ...(userData.workouts || []),
            ...(userData.nutrition || []),
            ...(userData.hydration || []),
            ...(userData.painFatigue || []),
            ...(userData.scheduling || []),
            ...(userData.habits || [])
        ];

        if (allActivities.length > 0) {
            const sortedActivities = allActivities.sort((a, b) => 
                new Date(b.timestamp || b.date || b.createdAt) - new Date(a.timestamp || a.date || a.createdAt)
            );
            stats.lastActivity = sortedActivities[0].timestamp || sortedActivities[0].date || sortedActivities[0].createdAt;
        }

        res.json({ stats });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get statistics',
            details: 'An error occurred while retrieving user statistics'
        });
    }
});

module.exports = router;
