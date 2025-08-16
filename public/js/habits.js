// Habits Module
class HabitsModule {
    constructor() {
        this.habits = [];
        this.habitProgress = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHabitsData();
        this.updateTodayHabits();
        this.updateHabitProgress();
    }

    setupEventListeners() {
        // Habit form
        const habitForm = document.getElementById('habit-form');
        if (habitForm) {
            habitForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addHabit();
            });
        }
    }

    loadHabitsData() {
        this.habits = window.fitnessApp.getData('habits') || [];
        this.habitProgress = window.fitnessApp.getData('habitProgress') || {};
    }

    addHabit() {
        try {
            const habitName = document.getElementById('habit-name').value.trim();

            if (!habitName) {
                throw new Error('Please enter a habit name');
            }

            if (habitName.length < 3) {
                throw new Error('Habit name must be at least 3 characters long');
            }

            // Check if habit already exists
            if (this.habits.find(h => h.name.toLowerCase() === habitName.toLowerCase())) {
                throw new Error('This habit already exists');
            }

            // Create new habit
            const habit = {
                id: this.generateHabitId(),
                name: habitName,
                createdAt: new Date().toISOString(),
                active: true
            };

            // Add to habits
            this.habits.push(habit);
            window.fitnessApp.saveData('habits', this.habits);

            // Initialize progress for this habit
            this.habitProgress[habit.id] = {};
            window.fitnessApp.saveData('habitProgress', this.habitProgress);

            // Update displays
            this.updateTodayHabits();
            this.updateHabitProgress();

            // Clear form
            document.getElementById('habit-form').reset();

            // Show success message
            window.fitnessApp.showNotification('Habit added successfully!', 'success');

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    toggleHabit(habitId) {
        const today = window.fitnessApp.getToday();
        const habit = this.habits.find(h => h.id === habitId);
        
        if (!habit) {
            window.fitnessApp.showNotification('Habit not found', 'error');
            return;
        }

        // Initialize habit progress if not exists
        if (!this.habitProgress[habitId]) {
            this.habitProgress[habitId] = {};
        }

        // Toggle completion for today
        if (this.habitProgress[habitId][today]) {
            delete this.habitProgress[habitId][today];
            window.fitnessApp.showNotification(`Marked "${habit.name}" as incomplete`, 'info');
        } else {
            this.habitProgress[habitId][today] = {
                completed: true,
                timestamp: new Date().toISOString()
            };
            window.fitnessApp.showNotification(`Completed "${habit.name}"!`, 'success');
        }

        // Save progress
        window.fitnessApp.saveData('habitProgress', this.habitProgress);

        // Update displays
        this.updateTodayHabits();
        this.updateHabitProgress();
    }

    deleteHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) {
            window.fitnessApp.showNotification('Habit not found', 'error');
            return;
        }

        // Remove habit
        const habitIndex = this.habits.findIndex(h => h.id === habitId);
        this.habits.splice(habitIndex, 1);
        window.fitnessApp.saveData('habits', this.habits);

        // Remove progress data
        delete this.habitProgress[habitId];
        window.fitnessApp.saveData('habitProgress', this.habitProgress);

        // Update displays
        this.updateTodayHabits();
        this.updateHabitProgress();

        window.fitnessApp.showNotification(`Habit "${habit.name}" deleted`, 'success');
    }

    updateTodayHabits() {
        const container = document.getElementById('today-habits');
        if (!container) return;

        if (this.habits.length === 0) {
            container.innerHTML = '<p class="empty-state">No habits created yet</p>';
            return;
        }

        const today = window.fitnessApp.getToday();
        const activeHabits = this.habits.filter(habit => habit.active);

        const habitsHTML = activeHabits.map(habit => {
            const isCompleted = this.habitProgress[habit.id] && this.habitProgress[habit.id][today];
            
            return `
                <div class="habit-item ${isCompleted ? 'completed' : ''}">
                    <div class="habit-checkbox" onclick="habitsModule.toggleHabit('${habit.id}')">
                        ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-date">${isCompleted ? 'Completed' : 'Not done'}</div>
                    <button class="btn-danger btn-sm" onclick="habitsModule.deleteHabit('${habit.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = habitsHTML;
    }

    updateHabitProgress() {
        const container = document.getElementById('habit-progress');
        if (!container) return;

        if (this.habits.length === 0) {
            container.innerHTML = '<p class="empty-state">No habit data to display</p>';
            return;
        }

        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const activeHabits = this.habits.filter(habit => habit.active);

        if (activeHabits.length === 0) {
            container.innerHTML = '<p class="empty-state">No active habits</p>';
            return;
        }

        const progressHTML = activeHabits.map(habit => {
            const completionRate = this.calculateHabitCompletionRate(habit.id, last7Days);
            const streak = this.calculateHabitStreak(habit.id);
            
            return `
                <div class="analysis-item">
                    <div class="analysis-title">${habit.name}</div>
                    <div class="analysis-content">
                        <div class="habit-stats">
                            <div class="stat-row">
                                <span>Completion Rate (7 days):</span>
                                <span class="stat-value">${completionRate.toFixed(1)}%</span>
                            </div>
                            <div class="stat-row">
                                <span>Current Streak:</span>
                                <span class="stat-value">${streak} day(s)</span>
                            </div>
                        </div>
                        <div class="habit-week-view">
                            ${last7Days.map(date => {
                                const isCompleted = this.habitProgress[habit.id] && this.habitProgress[habit.id][date];
                                const isToday = date === window.fitnessApp.getToday();
                                return `
                                    <div class="day-indicator ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                                         title="${window.fitnessApp.formatDate(date)}">
                                        ${isToday ? 'T' : date.split('-')[2]}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = progressHTML;
    }

    calculateHabitCompletionRate(habitId, days) {
        if (!this.habitProgress[habitId]) return 0;

        const completedDays = days.filter(date => 
            this.habitProgress[habitId][date] && this.habitProgress[habitId][date].completed
        ).length;

        return (completedDays / days.length) * 100;
    }

    calculateHabitStreak(habitId) {
        if (!this.habitProgress[habitId]) return 0;

        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);

        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            if (this.habitProgress[habitId][dateStr] && this.habitProgress[habitId][dateStr].completed) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    generateHabitId() {
        return 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get habits statistics
    getHabitsStats() {
        if (this.habits.length === 0) {
            return {
                totalHabits: 0,
                activeHabits: 0,
                averageCompletionRate: 0,
                bestHabit: null,
                worstHabit: null,
                totalCompletions: 0
            };
        }

        const activeHabits = this.habits.filter(habit => habit.active);
        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        // Calculate completion rates for each habit
        const habitStats = activeHabits.map(habit => {
            const completionRate = this.calculateHabitCompletionRate(habit.id, last7Days);
            const streak = this.calculateHabitStreak(habit.id);
            const totalCompletions = this.habitProgress[habit.id] 
                ? Object.values(this.habitProgress[habit.id]).filter(entry => entry.completed).length
                : 0;

            return {
                habit: habit,
                completionRate: completionRate,
                streak: streak,
                totalCompletions: totalCompletions
            };
        });

        const averageCompletionRate = habitStats.reduce((sum, stat) => sum + stat.completionRate, 0) / habitStats.length;
        const bestHabit = habitStats.reduce((best, current) => 
            current.completionRate > best.completionRate ? current : best
        );
        const worstHabit = habitStats.reduce((worst, current) => 
            current.completionRate < worst.completionRate ? current : worst
        );
        const totalCompletions = habitStats.reduce((sum, stat) => sum + stat.totalCompletions, 0);

        return {
            totalHabits: this.habits.length,
            activeHabits: activeHabits.length,
            averageCompletionRate,
            bestHabit: bestHabit.habit,
            worstHabit: worstHabit.habit,
            totalCompletions
        };
    }

    // Get today's habits summary
    getTodayHabitsSummary() {
        const today = window.fitnessApp.getToday();
        const activeHabits = this.habits.filter(habit => habit.active);
        
        const completedHabits = activeHabits.filter(habit => 
            this.habitProgress[habit.id] && this.habitProgress[habit.id][today]
        );

        return {
            totalHabits: activeHabits.length,
            completedHabits: completedHabits.length,
            completionRate: activeHabits.length > 0 ? (completedHabits.length / activeHabits.length) * 100 : 0,
            habits: activeHabits.map(habit => ({
                habit: habit,
                completed: this.habitProgress[habit.id] && this.habitProgress[habit.id][today]
            }))
        };
    }

    // Get habit insights
    getHabitInsights() {
        const stats = this.getHabitsStats();
        const today = this.getTodayHabitsSummary();
        const insights = [];

        if (stats.totalHabits === 0) {
            insights.push('No habits created yet. Start by adding your first fitness habit!');
        } else {
            if (stats.averageCompletionRate > 80) {
                insights.push('Excellent! You\'re maintaining very high habit completion rates.');
            } else if (stats.averageCompletionRate > 60) {
                insights.push('Good job! You\'re doing well with your habits.');
            } else if (stats.averageCompletionRate < 40) {
                insights.push('Your habit completion rate is low. Consider simplifying your habits or reducing the number.');
            }

            if (stats.bestHabit) {
                insights.push(`Your best performing habit is "${stats.bestHabit.name}" with ${stats.getHabitsStats ? 'high' : 'good'} completion rate.`);
            }

            if (stats.worstHabit && stats.worstHabit.id !== stats.bestHabit?.id) {
                insights.push(`Consider focusing on "${stats.worstHabit.name}" - it has the lowest completion rate.`);
            }

            if (today.completionRate === 100) {
                insights.push('Perfect! You\'ve completed all your habits today.');
            } else if (today.completionRate > 70) {
                insights.push('Great progress today! You\'re on track with your habits.');
            } else if (today.completionRate < 50) {
                insights.push('You\'re behind on today\'s habits. Try to complete at least one more.');
            }
        }

        return insights;
    }

    // Get habit recommendations
    getHabitRecommendations() {
        const stats = this.getHabitsStats();
        const recommendations = [];

        if (stats.totalHabits === 0) {
            recommendations.push('Start with 1-2 simple habits');
            recommendations.push('Choose habits that align with your fitness goals');
            recommendations.push('Make habits specific and measurable');
        } else {
            if (stats.averageCompletionRate < 50) {
                recommendations.push('Reduce the number of habits to focus on consistency');
                recommendations.push('Make habits easier to complete');
                recommendations.push('Set reminders for your habits');
            }

            if (stats.totalHabits > 5) {
                recommendations.push('Consider reducing the number of habits to avoid overwhelm');
            }

            if (stats.totalHabits < 3) {
                recommendations.push('You can add more habits as you build consistency');
            }

            recommendations.push('Track your progress daily');
            recommendations.push('Celebrate small wins');
            recommendations.push('Be patient - habits take time to form');
        }

        return recommendations;
    }

    // Export habits data
    exportHabitsData() {
        const exportData = {
            habits: this.habits,
            habitProgress: this.habitProgress,
            stats: this.getHabitsStats(),
            insights: this.getHabitInsights(),
            recommendations: this.getHabitRecommendations(),
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }

    // Import habits data
    importHabitsData(data) {
        try {
            const importData = JSON.parse(data);
            
            if (!importData.habits) {
                throw new Error('Invalid habits data format');
            }

            this.habits = importData.habits;
            this.habitProgress = importData.habitProgress || {};

            // Save data
            window.fitnessApp.saveData('habits', this.habits);
            window.fitnessApp.saveData('habitProgress', this.habitProgress);

            // Update displays
            this.updateTodayHabits();
            this.updateHabitProgress();

            window.fitnessApp.showNotification('Habits data imported successfully!', 'success');

        } catch (error) {
            throw new Error(`Failed to import habits data: ${error.message}`);
        }
    }

    // Reset habit progress
    resetHabitProgress(habitId) {
        if (habitId) {
            // Reset specific habit
            this.habitProgress[habitId] = {};
            window.fitnessApp.saveData('habitProgress', this.habitProgress);
            this.updateTodayHabits();
            this.updateHabitProgress();
            window.fitnessApp.showNotification('Habit progress reset', 'success');
        } else {
            // Reset all habits
            this.habitProgress = {};
            window.fitnessApp.saveData('habitProgress', this.habitProgress);
            this.updateTodayHabits();
            this.updateHabitProgress();
            window.fitnessApp.showNotification('All habit progress reset', 'success');
        }
    }
}

// Initialize habits module
document.addEventListener('DOMContentLoaded', () => {
    window.habitsModule = new HabitsModule();
});

// Export for use in other modules
window.HabitsModule = HabitsModule;
