const express = require('express');
const router = express.Router();
const { Nutrition } = require('../models');

// Create nutrition entry
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date, meals, totalCalories, totalProtein, totalCarbs, totalFat, totalFiber, waterIntake, notes } = req.body;

        // Validation
        if (!meals || !Array.isArray(meals) || meals.length === 0) {
            return res.status(400).json({ 
                error: 'At least one meal is required',
                details: 'Nutrition entry must contain at least one meal'
            });
        }

        // Create individual nutrition entries for each food item
        const nutritionEntries = [];
        
        for (const meal of meals) {
            if (meal.foods && Array.isArray(meal.foods)) {
                for (const food of meal.foods) {
                    const nutritionEntry = await Nutrition.create({
                        userId,
                        date: date || new Date().toISOString().split('T')[0],
                        meal: meal.meal || 'snack',
                        foodName: food.name || 'Unknown Food',
                        calories: food.calories || 0,
                        protein: food.protein || 0,
                        carbs: food.carbs || 0,
                        fat: food.fat || 0,
                        fiber: food.fiber || 0,
                        sugar: food.sugar || 0,
                        sodium: food.sodium || 0,
                        servingSize: food.servingSize || '1 serving',
                        quantity: food.quantity || 1,
                        unit: food.unit || 'serving',
                        notes: food.notes || notes || ''
                    });
                    nutritionEntries.push(nutritionEntry);
                }
            }
        }

        // Calculate totals
        const totals = nutritionEntries.reduce((acc, entry) => ({
            calories: acc.calories + (entry.calories || 0),
            protein: acc.protein + parseFloat(entry.protein || 0),
            carbs: acc.carbs + parseFloat(entry.carbs || 0),
            fat: acc.fat + parseFloat(entry.fat || 0),
            fiber: acc.fiber + parseFloat(entry.fiber || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

        res.status(201).json({
            message: 'Nutrition entry created successfully',
            entry: {
                id: nutritionEntries[0]?.id,
                date: date || new Date().toISOString().split('T')[0],
                meals: meals,
                totalCalories: totals.calories,
                totalProtein: totals.protein,
                totalCarbs: totals.carbs,
                totalFat: totals.fat,
                totalFiber: totals.fiber,
                waterIntake: waterIntake || 0,
                notes: notes || ''
            }
        });

    } catch (error) {
        console.error('Create nutrition entry error:', error);
        res.status(500).json({ 
            error: 'Failed to create nutrition entry',
            details: 'An error occurred while creating the nutrition entry'
        });
    }
});

// Get all nutrition entries
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate, minCalories, maxCalories, meal, category } = req.query;

        let whereClause = { userId };
        
        // Apply filters
        if (startDate && endDate) {
            whereClause.date = {
                [require('sequelize').Op.between]: [startDate, endDate]
            };
        }

        if (meal) {
            whereClause.meal = meal;
        }

        if (category) {
            whereClause.category = category;
        }

        const entries = await Nutrition.findAll({ 
            where: whereClause,
            order: [['date', 'DESC']]
        });

        res.json({ 
            entries: entries.map(entry => ({
                ...entry.toJSON(),
                meals: JSON.parse(entry.meals || '[]')
            }))
        });

    } catch (error) {
        console.error('Get nutrition entries error:', error);
        res.status(500).json({ 
            error: 'Failed to get nutrition entries',
            details: 'An error occurred while retrieving nutrition entries'
        });
    }
});

// Get nutrition statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.userId;

        const entries = await Nutrition.findAll({ where: { userId } });
        
        if (entries.length === 0) {
            return res.json({
                stats: {
                    totalEntries: 0,
                    averageCalories: 0,
                    averageProtein: 0,
                    averageCarbs: 0,
                    averageFat: 0,
                    totalWaterIntake: 0,
                    calorieTrend: [],
                    macroDistribution: {},
                    dailyGoal: 2000,
                    goalProgress: 0
                }
            });
        }

        const totalEntries = entries.length;
        const totalCalories = entries.reduce((sum, entry) => sum + (entry.totalCalories || 0), 0);
        const totalProtein = entries.reduce((sum, entry) => sum + (entry.totalProtein || 0), 0);
        const totalCarbs = entries.reduce((sum, entry) => sum + (entry.totalCarbs || 0), 0);
        const totalFat = entries.reduce((sum, entry) => sum + (entry.totalFat || 0), 0);
        const totalWaterIntake = entries.reduce((sum, entry) => sum + (entry.waterIntake || 0), 0);

        const stats = {
            totalEntries,
            averageCalories: Math.round(totalCalories / totalEntries),
            averageProtein: Math.round(totalProtein / totalEntries),
            averageCarbs: Math.round(totalCarbs / totalEntries),
            averageFat: Math.round(totalFat / totalEntries),
            totalWaterIntake,
            calorieTrend: entries.slice(-7).map(entry => ({
                date: entry.date,
                calories: entry.totalCalories
            })),
            macroDistribution: {
                protein: Math.round((totalProtein * 4 / totalCalories) * 100) || 0,
                carbs: Math.round((totalCarbs * 4 / totalCalories) * 100) || 0,
                fat: Math.round((totalFat * 9 / totalCalories) * 100) || 0
            },
            dailyGoal: 2000,
            goalProgress: Math.round((totalCalories / (totalEntries * 2000)) * 100)
        };

        res.json({ stats });

    } catch (error) {
        console.error('Get nutrition stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get nutrition statistics',
            details: 'An error occurred while retrieving nutrition statistics'
        });
    }
});

// Get specific nutrition entry
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const entry = await Nutrition.findOne({ where: { id, userId } });
        
        if (!entry) {
            return res.status(404).json({ 
                error: 'Nutrition entry not found',
                details: 'The requested nutrition entry could not be found'
            });
        }

        res.json({ 
            entry: {
                ...entry.toJSON(),
                meals: JSON.parse(entry.meals || '[]')
            }
        });

    } catch (error) {
        console.error('Get nutrition entry error:', error);
        res.status(500).json({ 
            error: 'Failed to get nutrition entry',
            details: 'An error occurred while retrieving the nutrition entry'
        });
    }
});

// Update nutrition entry
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;

        const entry = await Nutrition.findOne({ where: { id, userId } });
        
        if (!entry) {
            return res.status(404).json({ 
                error: 'Nutrition entry not found',
                details: 'The requested nutrition entry could not be found'
            });
        }

        // Handle meals array conversion
        if (updateData.meals) {
            updateData.meals = JSON.stringify(updateData.meals);
        }

        await entry.update(updateData);

        res.json({
            message: 'Nutrition entry updated successfully',
            entry: {
                ...entry.toJSON(),
                meals: JSON.parse(entry.meals || '[]')
            }
        });

    } catch (error) {
        console.error('Update nutrition entry error:', error);
        res.status(500).json({ 
            error: 'Failed to update nutrition entry',
            details: 'An error occurred while updating the nutrition entry'
        });
    }
});

// Delete nutrition entry
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const entry = await Nutrition.findOne({ where: { id, userId } });
        
        if (!entry) {
            return res.status(404).json({ 
                error: 'Nutrition entry not found',
                details: 'The requested nutrition entry could not be found'
            });
        }

        await entry.destroy();

        res.json({
            message: 'Nutrition entry deleted successfully'
        });

    } catch (error) {
        console.error('Delete nutrition entry error:', error);
        res.status(500).json({ 
            error: 'Failed to delete nutrition entry',
            details: 'An error occurred while deleting the nutrition entry'
        });
    }
});

module.exports = router;
