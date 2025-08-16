// Workout Module
class WorkoutModule {
    constructor() {
        this.currentWorkout = null;
        this.workoutData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWorkoutData();
        this.updateWorkoutHistory();
        this.checkProfileCompletion();
    }

    setupEventListeners() {
        // Generate workout button
        const generateBtn = document.getElementById('generate-workout-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateWorkout();
            });
        }

        // Workout log form
        const workoutForm = document.getElementById('workout-log-form');
        if (workoutForm) {
            workoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.logWorkout();
            });
        }
    }

    loadWorkoutData() {
        this.workoutData = window.fitnessApp.getData('workouts') || [];
    }

    checkProfileCompletion() {
        if (window.profileModule && window.profileModule.isProfileComplete()) {
            this.updateWorkoutGeneratorVisibility(true);
        } else {
            this.updateWorkoutGeneratorVisibility(false);
        }
    }

    updateWorkoutGeneratorVisibility(show) {
        const profileCheck = document.getElementById('profile-check');
        const workoutGenerator = document.getElementById('workout-generator');

        if (show) {
            if (profileCheck) profileCheck.classList.add('hidden');
            if (workoutGenerator) workoutGenerator.classList.remove('hidden');
        } else {
            if (profileCheck) profileCheck.classList.remove('hidden');
            if (workoutGenerator) workoutGenerator.classList.add('hidden');
        }
    }

    generateWorkout() {
        try {
            const profile = window.profileModule.getProfile();
            if (!profile) {
                throw new Error('Please complete your profile first');
            }

            const workout = this.createAIWorkout(profile);
            this.currentWorkout = workout;
            this.displayCurrentWorkout(workout);

            window.fitnessApp.showNotification('Workout generated successfully!', 'success');

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    createAIWorkout(profile) {
        const goal = profile.goal;
        const experience = profile.experience;
        const medicalInfo = profile.medical || '';

        // Exercise database based on goals
        const exerciseDatabase = {
            'build-muscle': {
                beginner: [
                    { name: 'Push-ups', sets: 3, reps: 10, weight: 0 },
                    { name: 'Squats', sets: 3, reps: 12, weight: 0 },
                    { name: 'Dumbbell Rows', sets: 3, reps: 10, weight: 5 },
                    { name: 'Plank', sets: 3, reps: 30, weight: 0 },
                    { name: 'Lunges', sets: 3, reps: 10, weight: 0 }
                ],
                intermediate: [
                    { name: 'Bench Press', sets: 4, reps: 8, weight: 40 },
                    { name: 'Deadlifts', sets: 4, reps: 6, weight: 50 },
                    { name: 'Squats', sets: 4, reps: 8, weight: 45 },
                    { name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
                    { name: 'Overhead Press', sets: 3, reps: 8, weight: 25 }
                ],
                advanced: [
                    { name: 'Bench Press', sets: 5, reps: 5, weight: 60 },
                    { name: 'Deadlifts', sets: 5, reps: 5, weight: 80 },
                    { name: 'Squats', sets: 5, reps: 5, weight: 70 },
                    { name: 'Pull-ups', sets: 4, reps: 10, weight: 0 },
                    { name: 'Overhead Press', sets: 4, reps: 6, weight: 40 }
                ]
            },
            'lose-fat': {
                beginner: [
                    { name: 'Burpees', sets: 3, reps: 10, weight: 0 },
                    { name: 'Mountain Climbers', sets: 3, reps: 20, weight: 0 },
                    { name: 'Jumping Jacks', sets: 3, reps: 30, weight: 0 },
                    { name: 'High Knees', sets: 3, reps: 30, weight: 0 },
                    { name: 'Plank', sets: 3, reps: 45, weight: 0 }
                ],
                intermediate: [
                    { name: 'Kettlebell Swings', sets: 4, reps: 15, weight: 12 },
                    { name: 'Box Jumps', sets: 4, reps: 12, weight: 0 },
                    { name: 'Burpees', sets: 4, reps: 15, weight: 0 },
                    { name: 'Mountain Climbers', sets: 4, reps: 30, weight: 0 },
                    { name: 'Jump Rope', sets: 3, reps: 60, weight: 0 }
                ],
                advanced: [
                    { name: 'Kettlebell Swings', sets: 5, reps: 20, weight: 16 },
                    { name: 'Box Jumps', sets: 5, reps: 15, weight: 0 },
                    { name: 'Burpees', sets: 5, reps: 20, weight: 0 },
                    { name: 'Mountain Climbers', sets: 5, reps: 40, weight: 0 },
                    { name: 'Jump Rope', sets: 4, reps: 90, weight: 0 }
                ]
            },
            'improve-endurance': {
                beginner: [
                    { name: 'Jogging', sets: 1, reps: 20, weight: 0 },
                    { name: 'Cycling', sets: 1, reps: 30, weight: 0 },
                    { name: 'Walking', sets: 1, reps: 45, weight: 0 },
                    { name: 'Swimming', sets: 1, reps: 15, weight: 0 },
                    { name: 'Rowing', sets: 1, reps: 20, weight: 0 }
                ],
                intermediate: [
                    { name: 'Running', sets: 1, reps: 30, weight: 0 },
                    { name: 'Cycling', sets: 1, reps: 45, weight: 0 },
                    { name: 'Swimming', sets: 1, reps: 25, weight: 0 },
                    { name: 'Rowing', sets: 1, reps: 30, weight: 0 },
                    { name: 'Elliptical', sets: 1, reps: 35, weight: 0 }
                ],
                advanced: [
                    { name: 'Running', sets: 1, reps: 45, weight: 0 },
                    { name: 'Cycling', sets: 1, reps: 60, weight: 0 },
                    { name: 'Swimming', sets: 1, reps: 40, weight: 0 },
                    { name: 'Rowing', sets: 1, reps: 45, weight: 0 },
                    { name: 'Elliptical', sets: 1, reps: 50, weight: 0 }
                ]
            }
        };

        // Get exercises based on goal and experience
        let exercises = exerciseDatabase[goal][experience];
        
        if (!exercises) {
            exercises = exerciseDatabase['build-muscle']['beginner']; // fallback
        }

        // Apply medical limitations
        exercises = this.applyMedicalLimitations(exercises, medicalInfo);

        // Shuffle and select 4-6 exercises
        const shuffledExercises = this.shuffleArray(exercises);
        const selectedExercises = shuffledExercises.slice(0, Math.min(6, shuffledExercises.length));

        return {
            id: this.generateWorkoutId(),
            date: window.fitnessApp.getToday(),
            exercises: selectedExercises,
            goal: goal,
            experience: experience,
            generated: true
        };
    }

    applyMedicalLimitations(exercises, medicalInfo) {
        if (!medicalInfo) return exercises;

        const limitations = medicalInfo.toLowerCase();
        let filteredExercises = exercises;

        // Remove exercises based on medical conditions
        if (limitations.includes('back') || limitations.includes('spine')) {
            filteredExercises = filteredExercises.filter(ex => 
                !['deadlifts', 'squats', 'overhead press'].includes(ex.name.toLowerCase())
            );
        }

        if (limitations.includes('knee')) {
            filteredExercises = filteredExercises.filter(ex => 
                !['squats', 'lunges', 'box jumps', 'jumping jacks'].includes(ex.name.toLowerCase())
            );
        }

        if (limitations.includes('shoulder')) {
            filteredExercises = filteredExercises.filter(ex => 
                !['overhead press', 'pull-ups', 'push-ups'].includes(ex.name.toLowerCase())
            );
        }

        if (limitations.includes('heart') || limitations.includes('cardiac')) {
            filteredExercises = filteredExercises.filter(ex => 
                !['burpees', 'box jumps', 'jumping jacks', 'high knees'].includes(ex.name.toLowerCase())
            );
        }

        // If too many exercises were filtered out, add some safe alternatives
        if (filteredExercises.length < 3) {
            const safeExercises = [
                { name: 'Walking', sets: 1, reps: 30, weight: 0 },
                { name: 'Cycling', sets: 1, reps: 20, weight: 0 },
                { name: 'Swimming', sets: 1, reps: 15, weight: 0 },
                { name: 'Plank', sets: 3, reps: 30, weight: 0 },
                { name: 'Bird Dog', sets: 3, reps: 10, weight: 0 }
            ];
            filteredExercises = [...filteredExercises, ...safeExercises];
        }

        return filteredExercises;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    displayCurrentWorkout(workout) {
        const container = document.getElementById('current-workout');
        const section = document.getElementById('current-workout-section');

        if (!container || !section) return;

        const workoutHTML = `
            <div class="workout-header">
                <h4>Generated Workout - ${workout.goal.replace('-', ' ').toUpperCase()}</h4>
                <p>Experience Level: ${workout.experience}</p>
            </div>
            ${workout.exercises.map((exercise, index) => {
                const exerciseData = getExerciseByName(exercise.name);
                return `
                    <div class="exercise-item" data-exercise="${exercise.name.toLowerCase().replace(/\s+/g, '-')}">
                        <div class="exercise-header">
                            <div class="exercise-info">
                                <span class="exercise-name">${index + 1}. ${exercise.name}</span>
                                <span class="exercise-difficulty">${this.getDifficultyColor(exercise)}</span>
                            </div>
                            <div class="exercise-actions">
                                <button class="btn-secondary btn-sm exercise-details-btn" onclick="window.workoutModule.showExerciseDetails('${exercise.name}')">
                                    <i class="fas fa-info-circle"></i> Details
                                </button>
                            </div>
                        </div>
                        <div class="exercise-content">
                            <div class="exercise-media">
                                ${exerciseData ? `
                                    <img src="${exerciseData.image}" alt="${exercise.name}" class="exercise-image" loading="lazy">
                                    <div class="exercise-overlay">
                                        <button class="btn-primary btn-sm" onclick="window.workoutModule.playExerciseVideo('${exercise.name}')">
                                            <i class="fas fa-play"></i> Watch Demo
                                        </button>
                                    </div>
                                ` : `
                                    <div class="exercise-placeholder">
                                        <i class="fas fa-dumbbell"></i>
                                    </div>
                                `}
                            </div>
                            <div class="exercise-sets">
                                <div class="set-item">
                                    <div class="set-number">Sets</div>
                                    <div class="set-value">${exercise.sets}</div>
                                </div>
                                <div class="set-item">
                                    <div class="set-number">Reps</div>
                                    <div class="set-value">${exercise.reps}</div>
                                </div>
                                <div class="set-item">
                                    <div class="set-number">Weight</div>
                                    <div class="set-value">${exercise.weight} kg</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;

        container.innerHTML = workoutHTML;
        section.classList.remove('hidden');
    }

    getDifficultyColor(exercise) {
        if (exercise.weight === 0) return '<span style="color: #28a745;">Bodyweight</span>';
        if (exercise.weight <= 10) return '<span style="color: #ffc107;">Light</span>';
        if (exercise.weight <= 30) return '<span style="color: #fd7e14;">Medium</span>';
        return '<span style="color: #dc3545;">Heavy</span>';
    }

    showExerciseDetails(exerciseName) {
        const exerciseData = getExerciseByName(exerciseName);
        if (!exerciseData) {
            window.fitnessApp.showNotification('Exercise details not available', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal exercise-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-dumbbell"></i> ${exerciseData.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="exercise-details-grid">
                        <div class="exercise-image-section">
                            <img src="${exerciseData.image}" alt="${exerciseData.name}" class="exercise-detail-image">
                        </div>
                        <div class="exercise-info-section">
                            <div class="exercise-meta">
                                <span class="badge badge-${exerciseData.category}">${exerciseData.category}</span>
                                <span class="badge badge-${exerciseData.difficulty}">${exerciseData.difficulty}</span>
                            </div>
                            <div class="muscle-groups">
                                <h4>Muscle Groups</h4>
                                <div class="muscle-tags">
                                    ${exerciseData.muscleGroups.map(muscle => `<span class="muscle-tag">${muscle}</span>`).join('')}
                                </div>
                            </div>
                            <div class="instructions">
                                <h4>Instructions</h4>
                                <ol>
                                    ${exerciseData.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                                </ol>
                            </div>
                            <div class="tips">
                                <h4>Pro Tips</h4>
                                <ul>
                                    ${exerciseData.tips.map(tip => `<li>${tip}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="variations">
                                <h4>Variations</h4>
                                <div class="variation-tags">
                                    ${exerciseData.variations.map(variation => `<span class="variation-tag">${variation}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="window.workoutModule.playExerciseVideo('${exerciseName}')">
                        <i class="fas fa-play"></i> Watch Video Demo
                    </button>
                    <button class="btn-secondary" onclick="this.closest('.modal-backdrop').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    playExerciseVideo(exerciseName) {
        const exerciseData = getExerciseByName(exerciseName);
        if (!exerciseData || !exerciseData.video) {
            window.fitnessApp.showNotification('Video not available for this exercise', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal video-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-play-circle"></i> ${exerciseData.name} - Video Demo</h3>
                    <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="video-container">
                        <iframe src="${exerciseData.video}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-backdrop').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    logWorkout() {
        try {
            const exerciseName = document.getElementById('workout-exercise').value.trim();
            const sets = parseInt(document.getElementById('workout-sets').value);
            const reps = parseInt(document.getElementById('workout-reps').value);
            const weight = parseFloat(document.getElementById('workout-weight').value);

            // Validate inputs
            if (!exerciseName || !sets || !reps || !weight) {
                throw new Error('Please fill in all fields');
            }

            if (sets < 1 || reps < 1 || weight < 0) {
                throw new Error('Please enter valid numbers');
            }

            // Create workout entry
            const workoutEntry = {
                id: this.generateWorkoutId(),
                date: window.fitnessApp.getToday(),
                exercises: [{
                    name: exerciseName,
                    sets: sets,
                    reps: reps,
                    weight: weight
                }],
                generated: false
            };

            // Add to workout data
            this.workoutData.push(workoutEntry);
            window.fitnessApp.saveData('workouts', this.workoutData);

            // Update display
            this.updateWorkoutHistory();

            // Clear form
            document.getElementById('workout-log-form').reset();

            // Show success message
            window.fitnessApp.showNotification('Workout logged successfully!', 'success');

            // Check for achievement
            this.checkAchievements();

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    updateWorkoutHistory() {
        const container = document.getElementById('workout-history');
        if (!container) return;

        if (this.workoutData.length === 0) {
            container.innerHTML = '<p class="empty-state">No workout history yet</p>';
            return;
        }

        // Sort by date (newest first)
        const sortedWorkouts = this.workoutData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10); // Show last 10 workouts

        const historyHTML = sortedWorkouts.map(workout => {
            const totalVolume = workout.exercises.reduce((total, exercise) => {
                return total + (exercise.weight * exercise.sets * exercise.reps);
            }, 0);

            return `
                <div class="history-item">
                    <div class="history-header">
                        <div class="history-title">${workout.exercises.length} exercise(s) - ${totalVolume.toFixed(0)} kg total volume</div>
                        <div class="history-date">${window.fitnessApp.formatDate(workout.date)}</div>
                    </div>
                    <div class="history-details">
                        ${workout.exercises.map(exercise => 
                            `${exercise.name}: ${exercise.sets} sets × ${exercise.reps} reps @ ${exercise.weight} kg`
                        ).join('<br>')}
                        ${workout.generated ? '<br><em>AI Generated Workout</em>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = historyHTML;
    }

    checkAchievements() {
        const totalWorkouts = this.workoutData.length;
        
        if (totalWorkouts % 10 === 0) {
            window.fitnessApp.showNotification(
                `🎉 Achievement unlocked: ${totalWorkouts} workouts completed!`,
                'success'
            );
        }
    }

    generateWorkoutId() {
        return 'workout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get workout statistics
    getWorkoutStats() {
        if (this.workoutData.length === 0) {
            return {
                totalWorkouts: 0,
                totalVolume: 0,
                averageVolume: 0,
                mostUsedExercise: null,
                workoutStreak: 0
            };
        }

        const totalWorkouts = this.workoutData.length;
        const totalVolume = this.workoutData.reduce((total, workout) => {
            return total + workout.exercises.reduce((workoutTotal, exercise) => {
                return workoutTotal + (exercise.weight * exercise.sets * exercise.reps);
            }, 0);
        }, 0);

        const averageVolume = totalVolume / totalWorkouts;

        // Find most used exercise
        const exerciseCounts = {};
        this.workoutData.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
            });
        });

        const mostUsedExercise = Object.keys(exerciseCounts).reduce((a, b) => 
            exerciseCounts[a] > exerciseCounts[b] ? a : b
        );

        return {
            totalWorkouts,
            totalVolume,
            averageVolume,
            mostUsedExercise,
            workoutStreak: this.calculateWorkoutStreak()
        };
    }

    calculateWorkoutStreak() {
        if (this.workoutData.length === 0) return 0;

        const sortedWorkouts = this.workoutData
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedWorkouts.length; i++) {
            const workoutDate = new Date(sortedWorkouts[i].date);
            workoutDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}

// Initialize workout module
document.addEventListener('DOMContentLoaded', () => {
    window.workoutModule = new WorkoutModule();
});

// Export for use in other modules
window.WorkoutModule = WorkoutModule;
