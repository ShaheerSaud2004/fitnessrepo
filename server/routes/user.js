const express = require('express');
const router = express.Router();
const { User, Profile, Settings, Workout, Nutrition, Hydration, PainFatigue, Schedule, Habit } = require('../models');

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const profile = await Profile.findOne({ where: { userId } });
        const settings = await Settings.findOne({ where: { userId } });

        res.json({
            profile: profile || {},
            settings: settings || {
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
router.put('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, age, weight, height, fitnessGoals, medicalHistory, experienceLevel } = req.body;

        let profile = await Profile.findOne({ where: { userId } });
        
        if (!profile) {
            profile = await Profile.create({
                userId,
                name: name || '',
                age: age !== undefined ? (isNaN(parseInt(age)) ? null : parseInt(age)) : null,
                weight: weight !== undefined ? (isNaN(parseFloat(weight)) ? null : parseFloat(weight)) : null,
                height: height !== undefined ? (isNaN(parseFloat(height)) ? null : parseFloat(height)) : null,
                fitnessGoals: fitnessGoals || '',
                medicalHistory: medicalHistory || '',
                experienceLevel: experienceLevel || 'beginner'
            });
        } else {
            await profile.update({
                name: name || profile.name,
                age: age !== undefined ? (isNaN(parseInt(age)) ? null : parseInt(age)) : profile.age,
                weight: weight !== undefined ? (isNaN(parseFloat(weight)) ? null : parseFloat(weight)) : profile.weight,
                height: height !== undefined ? (isNaN(parseFloat(height)) ? null : parseFloat(height)) : profile.height,
                fitnessGoals: fitnessGoals || profile.fitnessGoals,
                medicalHistory: medicalHistory || profile.medicalHistory,
                experienceLevel: experienceLevel || profile.experienceLevel
            });
        }

        res.json({
            message: 'Profile updated successfully',
            profile: profile.toJSON()
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
router.get('/settings', async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const settings = await Settings.findOne({ where: { userId } });

        res.json({
            settings: settings || {
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
router.put('/settings', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { darkMode, units, notifications } = req.body;

        let settings = await Settings.findOne({ where: { userId } });
        
        if (!settings) {
            settings = await Settings.create({
                userId,
                darkMode: darkMode !== undefined ? darkMode : false,
                units: units || 'metric',
                notifications: notifications !== undefined ? notifications : true
            });
        } else {
            await settings.update({
                darkMode: darkMode !== undefined ? darkMode : settings.darkMode,
                units: units || settings.units,
                notifications: notifications !== undefined ? notifications : settings.notifications
            });
        }

        res.json({
            message: 'Settings updated successfully',
            settings: settings.toJSON()
        });

    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ 
            error: 'Failed to update settings',
            details: 'An error occurred while updating settings'
        });
    }
});

// Delete user account
router.delete('/account', async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Delete all user data
        await Profile.destroy({ where: { userId } });
        await Settings.destroy({ where: { userId } });
        await Workout.destroy({ where: { userId } });
        await Nutrition.destroy({ where: { userId } });
        await Hydration.destroy({ where: { userId } });
        await PainFatigue.destroy({ where: { userId } });
        await Schedule.destroy({ where: { userId } });
        await Habit.destroy({ where: { userId } });
        await User.destroy({ where: { id: userId } });

        res.json({
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ 
            error: 'Failed to delete account',
            details: 'An error occurred while deleting the account'
        });
    }
});

// Get user statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const [workouts, nutrition, hydration, painFatigue, schedule, habits] = await Promise.all([
            Workout.count({ where: { userId } }),
            Nutrition.count({ where: { userId } }),
            Hydration.count({ where: { userId } }),
            PainFatigue.count({ where: { userId } }),
            Schedule.count({ where: { userId } }),
            Habit.count({ where: { userId } })
        ]);

        const stats = {
            totalWorkouts: workouts,
            totalNutritionEntries: nutrition,
            totalHydrationEntries: hydration,
            totalPainFatigueEntries: painFatigue,
            totalScheduledEvents: schedule,
            totalHabits: habits
        };

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
