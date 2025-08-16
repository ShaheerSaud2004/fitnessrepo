const express = require('express');
const router = express.Router();

// Exercise database for AI workout generation
const exerciseDatabase = {
    strength: {
        chest: [
            { name: 'Push-ups', sets: 3, reps: '10-15', rest: '60s', difficulty: 'beginner' },
            { name: 'Bench Press', sets: 4, reps: '8-12', rest: '90s', difficulty: 'intermediate' },
            { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', rest: '60s', difficulty: 'intermediate' },
            { name: 'Incline Press', sets: 3, reps: '8-12', rest: '90s', difficulty: 'intermediate' }
        ],
        back: [
            { name: 'Pull-ups', sets: 3, reps: '5-10', rest: '90s', difficulty: 'intermediate' },
            { name: 'Bent-over Rows', sets: 4, reps: '10-12', rest: '90s', difficulty: 'intermediate' },
            { name: 'Lat Pulldowns', sets: 3, reps: '12-15', rest: '60s', difficulty: 'beginner' },
            { name: 'Deadlifts', sets: 3, reps: '6-8', rest: '120s', difficulty: 'advanced' }
        ],
        legs: [
            { name: 'Squats', sets: 4, reps: '12-15', rest: '90s', difficulty: 'beginner' },
            { name: 'Lunges', sets: 3, reps: '10-12 each', rest: '60s', difficulty: 'beginner' },
            { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s', difficulty: 'intermediate' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '10-12', rest: '90s', difficulty: 'intermediate' }
        ],
        shoulders: [
            { name: 'Overhead Press', sets: 3, reps: '8-12', rest: '90s', difficulty: 'intermediate' },
            { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '60s', difficulty: 'beginner' },
            { name: 'Front Raises', sets: 3, reps: '12-15', rest: '60s', difficulty: 'beginner' },
            { name: 'Upright Rows', sets: 3, reps: '10-12', rest: '60s', difficulty: 'intermediate' }
        ],
        arms: [
            { name: 'Bicep Curls', sets: 3, reps: '12-15', rest: '60s', difficulty: 'beginner' },
            { name: 'Tricep Dips', sets: 3, reps: '10-15', rest: '60s', difficulty: 'beginner' },
            { name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '60s', difficulty: 'beginner' },
            { name: 'Skull Crushers', sets: 3, reps: '10-12', rest: '60s', difficulty: 'intermediate' }
        ],
        core: [
            { name: 'Planks', sets: 3, reps: '30-60s', rest: '60s', difficulty: 'beginner' },
            { name: 'Crunches', sets: 3, reps: '15-20', rest: '45s', difficulty: 'beginner' },
            { name: 'Russian Twists', sets: 3, reps: '20 each side', rest: '45s', difficulty: 'intermediate' },
            { name: 'Leg Raises', sets: 3, reps: '12-15', rest: '60s', difficulty: 'intermediate' }
        ]
    },
    cardio: [
        { name: 'Running', duration: '20-30 min', intensity: 'moderate', difficulty: 'beginner' },
        { name: 'Cycling', duration: '30-45 min', intensity: 'moderate', difficulty: 'beginner' },
        { name: 'Swimming', duration: '20-30 min', intensity: 'moderate', difficulty: 'intermediate' },
        { name: 'Rowing', duration: '15-20 min', intensity: 'high', difficulty: 'intermediate' },
        { name: 'Jump Rope', duration: '10-15 min', intensity: 'high', difficulty: 'intermediate' }
    ],
    flexibility: [
        { name: 'Static Stretching', duration: '10-15 min', focus: 'full body', difficulty: 'beginner' },
        { name: 'Dynamic Stretching', duration: '5-10 min', focus: 'pre-workout', difficulty: 'beginner' },
        { name: 'Yoga Flow', duration: '20-30 min', focus: 'flexibility & balance', difficulty: 'intermediate' },
        { name: 'Foam Rolling', duration: '10-15 min', focus: 'recovery', difficulty: 'beginner' }
    ]
};

// Generate AI workout
router.post('/generate', (req, res) => {
    try {
        const userId = req.user.userId;
        const { fitnessGoals, experienceLevel, medicalHistory, workoutType, duration } = req.body;

        const userData = req.userData.get(userId);
        const profile = userData?.profile || {};

        // Determine workout focus based on goals
        let focusAreas = [];
        if (fitnessGoals) {
            if (fitnessGoals.includes('strength') || fitnessGoals.includes('muscle')) {
                focusAreas.push('strength');
            }
            if (fitnessGoals.includes('cardio') || fitnessGoals.includes('endurance')) {
                focusAreas.push('cardio');
            }
            if (fitnessGoals.includes('flexibility') || fitnessGoals.includes('mobility')) {
                focusAreas.push('flexibility');
            }
        }

        // Default to strength if no specific goals
        if (focusAreas.length === 0) {
            focusAreas = ['strength'];
        }

        // Generate workout based on focus areas
        const workout = {
            id: Date.now().toString(),
            type: focusAreas[0] || 'strength', // Use the first focus area as the workout type
            duration: duration || '45-60 min',
            exercises: [],
            difficulty: experienceLevel || 'beginner',
            createdAt: new Date().toISOString()
        };

        // Add exercises based on focus areas
        if (focusAreas.includes('strength')) {
            // Select muscle groups to target
            const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
            const selectedGroups = muscleGroups.sort(() => 0.5 - Math.random()).slice(0, 3);

            selectedGroups.forEach(group => {
                const exercises = exerciseDatabase.strength[group];
                const filteredExercises = exercises.filter(ex => {
                    // Filter based on experience level
                    if (experienceLevel === 'beginner' && ex.difficulty === 'advanced') return false;
                    if (experienceLevel === 'intermediate' && ex.difficulty === 'advanced') return false;
                    
                    // Filter based on medical history
                    if (medicalHistory) {
                        if (medicalHistory.includes('back pain') && group === 'back') return false;
                        if (medicalHistory.includes('knee pain') && group === 'legs') return false;
                        if (medicalHistory.includes('shoulder pain') && group === 'shoulders') return false;
                    }
                    
                    return true;
                });

                if (filteredExercises.length > 0) {
                    const selectedExercise = filteredExercises[Math.floor(Math.random() * filteredExercises.length)];
                    workout.exercises.push({
                        ...selectedExercise,
                        muscleGroup: group,
                        completed: false
                    });
                }
            });
        }

        if (focusAreas.includes('cardio')) {
            const cardioExercises = exerciseDatabase.cardio.filter(ex => {
                if (experienceLevel === 'beginner' && ex.difficulty === 'advanced') return false;
                if (medicalHistory && medicalHistory.includes('heart condition') && ex.intensity === 'high') return false;
                return true;
            });

            if (cardioExercises.length > 0) {
                const selectedCardio = cardioExercises[Math.floor(Math.random() * cardioExercises.length)];
                workout.exercises.push({
                    ...selectedCardio,
                    muscleGroup: 'cardio',
                    completed: false
                });
            }
        }

        if (focusAreas.includes('flexibility')) {
            const flexibilityExercises = exerciseDatabase.flexibility.filter(ex => {
                if (experienceLevel === 'beginner' && ex.difficulty === 'advanced') return false;
                return true;
            });

            if (flexibilityExercises.length > 0) {
                const selectedFlex = flexibilityExercises[Math.floor(Math.random() * flexibilityExercises.length)];
                workout.exercises.push({
                    ...selectedFlex,
                    muscleGroup: 'flexibility',
                    completed: false
                });
            }
        }

        // Add workout tips and recommendations
        workout.tips = generateWorkoutTips(workout, profile, medicalHistory);

        res.json({
            message: 'Workout generated successfully',
            workout
        });

    } catch (error) {
        console.error('Generate workout error:', error);
        res.status(500).json({ 
            error: 'Failed to generate workout',
            details: 'An error occurred while generating the workout'
        });
    }
});

// Get all workouts
router.get('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, startDate, endDate } = req.query;
        const userData = req.userData.get(userId);

        if (!userData) {
            return res.json({ workouts: [] });
        }

        let workouts = userData.workouts || [];
        
        // Filter by type
        if (type) {
            workouts = workouts.filter(workout => workout.type === type);
        }

        // Filter by date range
        if (startDate && endDate) {
            workouts = workouts.filter(workout => {
                const workoutDate = workout.date.split('T')[0]; // Extract date part only
                return workoutDate >= startDate && workoutDate <= endDate;
            });
        }
        
        // Sort by date (newest first)
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ workouts });

    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({ 
            error: 'Failed to get workouts',
            details: 'An error occurred while retrieving workout data'
        });
    }
});

// Get workout statistics
router.get('/stats', (req, res) => {
    try {
        const userId = req.user.userId;
        const userData = req.userData.get(userId);

        if (!userData) {
            return res.json({ 
                stats: {
                    totalWorkouts: 0,
                    totalVolume: 0,
                    averageWorkoutsPerWeek: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    favoriteExercise: null,
                    totalDuration: 0,
                    workoutsThisWeek: 0,
                    workoutsThisMonth: 0,
                    workoutTypes: {},
                    streak: 0
                }
            });
        }

        const workouts = userData.workouts || [];
        
        if (workouts.length === 0) {
            return res.json({
                stats: {
                    totalWorkouts: 0,
                    totalVolume: 0,
                    averageWorkoutsPerWeek: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    favoriteExercise: null,
                    totalDuration: 0,
                    workoutsThisWeek: 0,
                    workoutsThisMonth: 0,
                    workoutTypes: {},
                    streak: 0
                }
            });
        }

        // Calculate statistics
        const totalWorkouts = workouts.length;
        const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
        const totalDuration = workouts.reduce((sum, w) => {
            const duration = parseInt(w.duration) || 45;
            return sum + duration;
        }, 0);

        // Calculate streaks
        const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        const currentStreak = calculateCurrentStreak(sortedWorkouts);
        const longestStreak = calculateLongestStreak(sortedWorkouts);

        // Calculate average workouts per week
        const firstWorkout = new Date(sortedWorkouts[sortedWorkouts.length - 1].date);
        const lastWorkout = new Date(sortedWorkouts[0].date);
        const weeksDiff = Math.max(1, Math.ceil((lastWorkout - firstWorkout) / (1000 * 60 * 60 * 24 * 7)));
        const averageWorkoutsPerWeek = (totalWorkouts / weeksDiff).toFixed(1);

        // Find favorite exercise
        const exerciseCounts = {};
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
            });
        });

        const favoriteExercise = Object.keys(exerciseCounts).length > 0 
            ? Object.keys(exerciseCounts).reduce((a, b) => exerciseCounts[a] > exerciseCounts[b] ? a : b)
            : null;

        // Calculate workout types
        const workoutTypes = {};
        workouts.forEach(workout => {
            workoutTypes[workout.type] = (workoutTypes[workout.type] || 0) + 1;
        });

        // Calculate workouts this week and month
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const workoutsThisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length;
        const workoutsThisMonth = workouts.filter(w => new Date(w.date) >= oneMonthAgo).length;

        const stats = {
            totalWorkouts,
            totalVolume,
            averageWorkoutsPerWeek: parseFloat(averageWorkoutsPerWeek),
            currentStreak,
            longestStreak,
            favoriteExercise,
            totalDuration,
            workoutsThisWeek,
            workoutsThisMonth,
            workoutTypes,
            streak: currentStreak // Add streak property for backward compatibility
        };

        res.json({ stats });

    } catch (error) {
        console.error('Get workout stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get workout statistics',
            details: 'An error occurred while retrieving workout statistics'
        });
    }
});

// Get specific workout
router.get('/:id', (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const userData = req.userData.get(userId);
        if (!userData || !userData.workouts) {
            return res.status(404).json({ 
                error: 'Workout not found',
                details: 'The requested workout could not be found'
            });
        }

        const workout = userData.workouts.find(w => w.id === id);
        if (!workout) {
            return res.status(404).json({ 
                error: 'Workout not found',
                details: 'The requested workout could not be found'
            });
        }

        res.json({ workout });

    } catch (error) {
        console.error('Get workout error:', error);
        res.status(500).json({ 
            error: 'Failed to get workout',
            details: 'An error occurred while retrieving the workout'
        });
    }
});

// Log a workout
router.post('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, exercises, date, duration, notes, type } = req.body;

        if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({ 
                error: 'Workout must contain at least one exercise',
                details: 'Please add at least one exercise to your workout'
            });
        }

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

        const workout = {
            id: Date.now().toString(),
            userId: userId,
            name: name ? name.trim() : `${type || 'Workout'} - ${new Date().toLocaleDateString()}`,
            exercises: exercises.map(ex => ({
                ...ex,
                id: ex.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
            })),
            date: date || new Date().toISOString(),
            duration: duration || '45 min',
            notes: notes || '',
            type: type || 'strength',
            difficulty: 'beginner', // Default difficulty
            createdAt: new Date().toISOString()
        };

        // Calculate workout statistics
        workout.totalVolume = calculateWorkoutVolume(workout.exercises);
        workout.exerciseCount = workout.exercises.length;

        userData.workouts.push(workout);
        req.userData.set(userId, userData);

        // Check for achievements
        const achievements = checkWorkoutAchievements(userData.workouts);

        res.status(201).json({
            message: 'Workout created successfully',
            workout,
            achievements
        });

    } catch (error) {
        console.error('Log workout error:', error);
        res.status(500).json({ 
            error: 'Failed to log workout',
            details: 'An error occurred while logging the workout'
        });
    }
});

// Update a workout
router.put('/:workoutId', (req, res) => {
    try {
        const userId = req.user.userId;
        const { workoutId } = req.params;
        const { name, exercises, date, duration, notes, type } = req.body;

        const userData = req.userData.get(userId);
        if (!userData) {
            return res.status(404).json({ 
                error: 'User data not found',
                details: 'No workout data available'
            });
        }

        const workoutIndex = userData.workouts.findIndex(w => w.id === workoutId);
        if (workoutIndex === -1) {
            return res.status(404).json({ 
                error: 'Workout not found',
                details: 'The specified workout could not be found'
            });
        }

        // Update workout
        userData.workouts[workoutIndex] = {
            ...userData.workouts[workoutIndex],
            name: name || userData.workouts[workoutIndex].name,
            exercises: exercises || userData.workouts[workoutIndex].exercises,
            date: date || userData.workouts[workoutIndex].date,
            duration: duration || userData.workouts[workoutIndex].duration,
            notes: notes !== undefined ? notes : userData.workouts[workoutIndex].notes,
            type: type || userData.workouts[workoutIndex].type,
            updatedAt: new Date().toISOString()
        };

        // Recalculate statistics
        userData.workouts[workoutIndex].totalVolume = calculateWorkoutVolume(userData.workouts[workoutIndex].exercises);
        userData.workouts[workoutIndex].exerciseCount = userData.workouts[workoutIndex].exercises.length;

        req.userData.set(userId, userData);

        res.json({
            message: 'Workout updated successfully',
            workout: userData.workouts[workoutIndex]
        });

    } catch (error) {
        console.error('Update workout error:', error);
        res.status(500).json({ 
            error: 'Failed to update workout',
            details: 'An error occurred while updating the workout'
        });
    }
});

// Delete a workout
router.delete('/:workoutId', (req, res) => {
    try {
        const userId = req.user.userId;
        const { workoutId } = req.params;

        const userData = req.userData.get(userId);
        if (!userData) {
            return res.status(404).json({ 
                error: 'User data not found',
                details: 'No workout data available'
            });
        }

        const workoutIndex = userData.workouts.findIndex(w => w.id === workoutId);
        if (workoutIndex === -1) {
            return res.status(404).json({ 
                error: 'Workout not found',
                details: 'The specified workout could not be found'
            });
        }

        const deletedWorkout = userData.workouts.splice(workoutIndex, 1)[0];
        req.userData.set(userId, userData);

        res.json({
            message: 'Workout deleted successfully',
            deletedWorkout
        });

    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({ 
            error: 'Failed to delete workout',
            details: 'An error occurred while deleting the workout'
        });
    }
});

// Helper functions
function generateWorkoutTips(workout, profile, medicalHistory) {
    const tips = [];

    if (profile.experienceLevel === 'beginner') {
        tips.push('Start with lighter weights and focus on proper form');
        tips.push('Take longer rest periods between sets (90-120 seconds)');
        tips.push('Don\'t hesitate to ask for help with exercise technique');
    }

    if (medicalHistory && medicalHistory.includes('back pain')) {
        tips.push('Avoid exercises that put strain on your lower back');
        tips.push('Focus on core strengthening exercises');
        tips.push('Consider consulting a physical therapist');
    }

    if (workout.type === 'strength') {
        tips.push('Warm up properly before starting your workout');
        tips.push('Progressive overload: gradually increase weight or reps');
        tips.push('Stay hydrated throughout your workout');
    }

    if (workout.type === 'cardio') {
        tips.push('Start with a 5-minute warm-up');
        tips.push('Monitor your heart rate during exercise');
        tips.push('Cool down with 5-10 minutes of light activity');
    }

    return tips;
}

function calculateWorkoutVolume(exercises) {
    return exercises.reduce((total, exercise) => {
        const sets = exercise.sets || 3;
        const reps = exercise.reps || 10;
        const weight = exercise.weight || 0;
        
        // Convert reps to number if it's a range
        const repNumber = typeof reps === 'string' ? parseInt(reps.split('-')[0]) : reps;
        
        return total + (sets * repNumber * weight);
    }, 0);
}

function calculateCurrentStreak(workouts) {
    if (workouts.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < workouts.length; i++) {
        const workoutDate = new Date(workouts[i].date);
        workoutDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === streak) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function calculateLongestStreak(workouts) {
    if (workouts.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < workouts.length; i++) {
        const prevDate = new Date(workouts[i - 1].date);
        const currDate = new Date(workouts[i].date);
        
        const daysDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }

    return Math.max(longestStreak, currentStreak);
}

function checkWorkoutAchievements(workouts) {
    const achievements = [];
    const totalWorkouts = workouts.length;

    if (totalWorkouts === 1) {
        achievements.push({ type: 'first_workout', message: '🎉 First workout completed! Keep it up!' });
    }
    if (totalWorkouts === 10) {
        achievements.push({ type: 'ten_workouts', message: '🔥 10 workouts completed! You\'re building a great habit!' });
    }
    if (totalWorkouts === 50) {
        achievements.push({ type: 'fifty_workouts', message: '💪 50 workouts! You\'re a fitness warrior!' });
    }
    if (totalWorkouts === 100) {
        achievements.push({ type: 'hundred_workouts', message: '🏆 100 workouts! You\'re absolutely crushing it!' });
    }

    return achievements;
}

module.exports = router;
