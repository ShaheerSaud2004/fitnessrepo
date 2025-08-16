// Exercise Database with Media
const ExerciseDatabase = {
    // Bodyweight Exercises
    'push-ups': {
        name: 'Push-ups',
        category: 'bodyweight',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        difficulty: 'beginner',
        instructions: [
            'Start in a plank position with hands slightly wider than shoulders',
            'Lower your body until chest nearly touches the floor',
            'Push back up to starting position',
            'Keep your body in a straight line throughout'
        ],
        tips: [
            'Keep your core tight',
            'Don\'t let your hips sag',
            'Breathe steadily throughout the movement'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/IODxDxX7oi4',
        variations: ['Knee push-ups', 'Diamond push-ups', 'Wide push-ups']
    },
    
    'squats': {
        name: 'Squats',
        category: 'bodyweight',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        difficulty: 'beginner',
        instructions: [
            'Stand with feet shoulder-width apart',
            'Lower your body as if sitting back into a chair',
            'Keep your chest up and knees behind toes',
            'Return to standing position'
        ],
        tips: [
            'Keep your weight in your heels',
            'Don\'t let your knees cave inward',
            'Go as low as you can while maintaining form'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/YaXPRqUwItQ',
        variations: ['Jump squats', 'Pistol squats', 'Sumo squats']
    },
    
    'lunges': {
        name: 'Lunges',
        category: 'bodyweight',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        difficulty: 'beginner',
        instructions: [
            'Step forward with one leg',
            'Lower your body until both knees are bent at 90 degrees',
            'Push back to starting position',
            'Alternate legs'
        ],
        tips: [
            'Keep your torso upright',
            'Don\'t let your front knee go past your toes',
            'Engage your core for balance'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/3XDriUn0udo',
        variations: ['Walking lunges', 'Reverse lunges', 'Side lunges']
    },
    
    'plank': {
        name: 'Plank',
        category: 'bodyweight',
        muscleGroups: ['core', 'shoulders', 'back'],
        difficulty: 'beginner',
        instructions: [
            'Start in a forearm plank position',
            'Keep your body in a straight line from head to heels',
            'Engage your core and glutes',
            'Hold the position'
        ],
        tips: [
            'Don\'t let your hips sag or lift',
            'Breathe steadily',
            'Keep your neck neutral'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/ASdvN_XEl_c',
        variations: ['Side plank', 'High plank', 'Plank with leg lifts']
    },
    
    // Weighted Exercises
    'dumbbell-rows': {
        name: 'Dumbbell Rows',
        category: 'weighted',
        muscleGroups: ['back', 'biceps', 'shoulders'],
        difficulty: 'beginner',
        instructions: [
            'Bend at the waist with a dumbbell in one hand',
            'Pull the dumbbell up to your hip',
            'Lower the weight back down',
            'Repeat on the other side'
        ],
        tips: [
            'Keep your back straight',
            'Don\'t rotate your torso',
            'Squeeze your shoulder blades together'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/roCP6wCXPqo',
        variations: ['Barbell rows', 'Cable rows', 'T-bar rows']
    },
    
    'bench-press': {
        name: 'Bench Press',
        category: 'weighted',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        difficulty: 'intermediate',
        instructions: [
            'Lie on bench with feet flat on the ground',
            'Grip the bar slightly wider than shoulder width',
            'Lower the bar to your chest',
            'Press the bar back up to starting position'
        ],
        tips: [
            'Keep your shoulder blades retracted',
            'Don\'t bounce the bar off your chest',
            'Control the movement throughout'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/rT7DgCr-3pg',
        variations: ['Dumbbell bench press', 'Incline bench press', 'Decline bench press']
    },
    
    'deadlifts': {
        name: 'Deadlifts',
        category: 'weighted',
        muscleGroups: ['back', 'glutes', 'hamstrings'],
        difficulty: 'intermediate',
        instructions: [
            'Stand with feet hip-width apart',
            'Bend at hips and knees to lower your hands to the bar',
            'Keep your back straight and chest up',
            'Stand up by pushing through your heels'
        ],
        tips: [
            'Keep the bar close to your body',
            'Don\'t round your back',
            'Push through your heels, not your toes'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/1ZXobu7JvvE',
        variations: ['Romanian deadlifts', 'Sumo deadlifts', 'Trap bar deadlifts']
    },
    
    'pull-ups': {
        name: 'Pull-ups',
        category: 'bodyweight',
        muscleGroups: ['back', 'biceps', 'shoulders'],
        difficulty: 'intermediate',
        instructions: [
            'Hang from pull-up bar with hands shoulder-width apart',
            'Pull your body up until your chin is over the bar',
            'Lower your body back down with control',
            'Repeat the movement'
        ],
        tips: [
            'Engage your core throughout',
            'Don\'t swing your body',
            'Focus on pulling with your back muscles'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/eGo4IYlbE5g',
        variations: ['Assisted pull-ups', 'Wide grip pull-ups', 'Chin-ups']
    },
    
    'overhead-press': {
        name: 'Overhead Press',
        category: 'weighted',
        muscleGroups: ['shoulders', 'triceps', 'chest'],
        difficulty: 'intermediate',
        instructions: [
            'Stand with feet shoulder-width apart',
            'Hold dumbbells at shoulder level',
            'Press the weights overhead',
            'Lower back to starting position'
        ],
        tips: [
            'Keep your core tight',
            'Don\'t lean back excessively',
            'Control the movement in both directions'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/qEwKCR5JCog',
        variations: ['Barbell overhead press', 'Arnold press', 'Push press']
    },
    
    // Advanced Exercises
    'burpees': {
        name: 'Burpees',
        category: 'cardio',
        muscleGroups: ['full body', 'cardio'],
        difficulty: 'intermediate',
        instructions: [
            'Start in standing position',
            'Drop into a squat position and place hands on ground',
            'Kick feet back into plank position',
            'Return feet to squat position and jump up'
        ],
        tips: [
            'Maintain good form throughout',
            'Land softly from the jump',
            'Keep moving at a steady pace'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/auBLPXOcFts',
        variations: ['Burpee with push-up', 'Burpee with pull-up', 'Burpee with box jump']
    },
    
    'mountain-climbers': {
        name: 'Mountain Climbers',
        category: 'cardio',
        muscleGroups: ['core', 'shoulders', 'cardio'],
        difficulty: 'beginner',
        instructions: [
            'Start in plank position',
            'Drive one knee toward your chest',
            'Quickly switch legs',
            'Continue alternating at a fast pace'
        ],
        tips: [
            'Keep your hips level',
            'Don\'t let your hips sag',
            'Maintain a steady rhythm'
        ],
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        video: 'https://www.youtube.com/embed/nmwgirgXLYM',
        variations: ['Cross-body mountain climbers', 'Slow mountain climbers', 'Mountain climbers with push-up']
    }
};

// Helper function to get exercise by name
function getExerciseByName(name) {
    const key = name.toLowerCase().replace(/\s+/g, '-');
    return ExerciseDatabase[key] || null;
}

// Helper function to get exercises by category
function getExercisesByCategory(category) {
    return Object.values(ExerciseDatabase).filter(exercise => exercise.category === category);
}

// Helper function to get exercises by difficulty
function getExercisesByDifficulty(difficulty) {
    return Object.values(ExerciseDatabase).filter(exercise => exercise.difficulty === difficulty);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ExerciseDatabase, getExerciseByName, getExercisesByCategory, getExercisesByDifficulty };
}
