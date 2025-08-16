// Dashboard Module
class DashboardModule {
    constructor() {
        this.progressChart = null;
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.updateStats();
        this.updateRecentActivity();
        this.initializeProgressChart();
    }

    loadDashboardData() {
        // Load workout data for progress chart
        this.workoutData = window.fitnessApp.getData('workouts') || [];
        this.nutritionData = window.fitnessApp.getData('nutrition') || [];
        this.hydrationData = window.fitnessApp.getData('hydration') || [];
        this.painFatigueData = window.fitnessApp.getData('painFatigue') || [];
    }

    updateStats() {
        const totalWorkouts = this.workoutData.length;
        const totalVolume = this.calculateTotalVolume();
        const currentStreak = this.calculateCurrentStreak();
        const avgEnergy = this.calculateAverageEnergy();

        document.getElementById('total-workouts').textContent = totalWorkouts;
        document.getElementById('total-volume').textContent = totalVolume.toFixed(0);
        document.getElementById('current-streak').textContent = currentStreak;
        document.getElementById('avg-energy').textContent = avgEnergy.toFixed(1);
    }

    calculateTotalVolume() {
        return this.workoutData.reduce((total, workout) => {
            return total + workout.exercises.reduce((workoutTotal, exercise) => {
                return workoutTotal + (exercise.weight * exercise.sets * exercise.reps);
            }, 0);
        }, 0);
    }

    calculateCurrentStreak() {
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

    calculateAverageEnergy() {
        if (this.painFatigueData.length === 0) return 0;

        const energyEntries = this.painFatigueData
            .filter(entry => entry.type === 'energy')
            .slice(-7); // Last 7 days

        if (energyEntries.length === 0) return 0;

        const totalEnergy = energyEntries.reduce((sum, entry) => sum + entry.level, 0);
        return totalEnergy / energyEntries.length;
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        
        if (!activityContainer) return;

        // Combine all activities and sort by date
        const allActivities = [];

        // Add workouts
        this.workoutData.slice(-5).forEach(workout => {
            allActivities.push({
                type: 'workout',
                title: `${workout.exercises.length} exercises completed`,
                time: workout.date,
                icon: 'fas fa-dumbbell'
            });
        });

        // Add nutrition entries
        this.nutritionData.slice(-5).forEach(meal => {
            allActivities.push({
                type: 'nutrition',
                title: `Logged ${meal.name}`,
                time: meal.date,
                icon: 'fas fa-apple-alt'
            });
        });

        // Add hydration entries
        this.hydrationData.slice(-5).forEach(entry => {
            allActivities.push({
                type: 'hydration',
                title: `Drank ${entry.amount}ml water`,
                time: entry.date,
                icon: 'fas fa-tint'
            });
        });

        // Sort by date (newest first)
        allActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Display recent activities
        if (allActivities.length === 0) {
            activityContainer.innerHTML = '<p class="empty-state">No recent activity</p>';
            return;
        }

        const activityHTML = allActivities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${window.fitnessApp.formatDateTime(activity.time)}</div>
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHTML;
    }

    initializeProgressChart() {
        const ctx = document.getElementById('progress-chart');
        if (!ctx) return;

        // Prepare data for the last 30 days
        const chartData = this.prepareChartData();

        this.progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Workout Volume (kg)',
                    data: chartData.volumes,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#666',
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#666',
                            callback: function(value) {
                                return value + ' kg';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#667eea'
                    }
                }
            }
        });
    }

    prepareChartData() {
        const labels = [];
        const volumes = [];
        const today = new Date();

        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            labels.push(window.fitnessApp.formatDate(date));
            
            // Find workout for this date
            const workout = this.workoutData.find(w => w.date === dateStr);
            if (workout) {
                const volume = workout.exercises.reduce((total, exercise) => {
                    return total + (exercise.weight * exercise.sets * exercise.reps);
                }, 0);
                volumes.push(volume);
            } else {
                volumes.push(0);
            }
        }

        return { labels, volumes };
    }

    updateChart() {
        if (this.progressChart) {
            const chartData = this.prepareChartData();
            this.progressChart.data.labels = chartData.labels;
            this.progressChart.data.datasets[0].data = chartData.volumes;
            this.progressChart.update();
        }
    }

    refresh() {
        this.loadDashboardData();
        this.updateStats();
        this.updateRecentActivity();
        this.updateChart();
    }
}

// Initialize dashboard module
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardModule = new DashboardModule();
});

// Export for use in other modules
window.DashboardModule = DashboardModule;
