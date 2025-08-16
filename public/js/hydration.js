// Hydration Module
class HydrationModule {
    constructor() {
        this.hydrationData = [];
        this.hydrationChart = null;
        this.targetHydration = 2000; // Default 2L per day
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHydrationData();
        this.updateHydrationDisplay();
        this.updateHydrationHistory();
        this.initializeHydrationChart();
    }

    setupEventListeners() {
        // Hydration form
        const hydrationForm = document.getElementById('hydration-form');
        if (hydrationForm) {
            hydrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addWater();
            });
        }

        // Quick add buttons
        document.querySelectorAll('.quick-add').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const amount = parseInt(button.dataset.amount);
                this.addWaterAmount(amount);
            });
        });
    }

    loadHydrationData() {
        this.hydrationData = window.fitnessApp.getData('hydration') || [];
    }

    addWater() {
        try {
            const amount = parseInt(document.getElementById('water-amount').value);

            if (!amount || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            this.addWaterAmount(amount);

            // Clear form
            document.getElementById('hydration-form').reset();

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    addWaterAmount(amount) {
        try {
            // Create hydration entry
            const hydrationEntry = {
                id: this.generateHydrationId(),
                amount: amount,
                date: window.fitnessApp.getToday(),
                time: new Date().toISOString()
            };

            // Add to hydration data
            this.hydrationData.push(hydrationEntry);
            window.fitnessApp.saveData('hydration', this.hydrationData);

            // Update displays
            this.updateHydrationDisplay();
            this.updateHydrationHistory();

            // Show success message
            window.fitnessApp.showNotification(`Added ${amount}ml of water!`, 'success');

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    updateHydrationDisplay() {
        const today = window.fitnessApp.getToday();
        const todayHydration = this.hydrationData.filter(entry => entry.date === today);
        const currentHydration = todayHydration.reduce((sum, entry) => sum + entry.amount, 0);
        const percentage = Math.min((currentHydration / this.targetHydration) * 100, 100);

        // Update text displays
        document.getElementById('current-hydration').textContent = currentHydration;
        document.getElementById('target-hydration').textContent = this.targetHydration;
        document.getElementById('hydration-percentage').textContent = percentage.toFixed(1) + '%';

        // Update chart
        this.updateHydrationChart(currentHydration, percentage);
    }

    initializeHydrationChart() {
        const ctx = document.getElementById('hydration-chart');
        if (!ctx) return;

        this.hydrationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Hydrated', 'Remaining'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [
                        '#667eea',
                        '#e1e5e9'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#fff'
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
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                if (label === 'Hydrated') {
                                    return `${label}: ${value.toFixed(1)}%`;
                                }
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                        }
                    }
                },
                cutout: '75%',
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });
    }

    updateHydrationChart(currentHydration, percentage) {
        if (!this.hydrationChart) return;

        const remaining = Math.max(0, 100 - percentage);
        
        this.hydrationChart.data.datasets[0].data = [percentage, remaining];
        
        // Update colors based on hydration level
        if (percentage >= 100) {
            this.hydrationChart.data.datasets[0].backgroundColor = ['#28a745', '#e1e5e9'];
        } else if (percentage >= 75) {
            this.hydrationChart.data.datasets[0].backgroundColor = ['#667eea', '#e1e5e9'];
        } else if (percentage >= 50) {
            this.hydrationChart.data.datasets[0].backgroundColor = ['#ffc107', '#e1e5e9'];
        } else {
            this.hydrationChart.data.datasets[0].backgroundColor = ['#dc3545', '#e1e5e9'];
        }

        this.hydrationChart.update();
    }

    updateHydrationHistory() {
        const container = document.getElementById('hydration-history');
        if (!container) return;

        if (this.hydrationData.length === 0) {
            container.innerHTML = '<p class="empty-state">No hydration history yet</p>';
            return;
        }

        // Group by date and calculate daily totals
        const dailyHydration = {};
        this.hydrationData.forEach(entry => {
            if (!dailyHydration[entry.date]) {
                dailyHydration[entry.date] = {
                    total: 0,
                    entries: []
                };
            }
            dailyHydration[entry.date].total += entry.amount;
            dailyHydration[entry.date].entries.push(entry);
        });

        // Sort by date (newest first) and take last 7 days
        const sortedDates = Object.keys(dailyHydration)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 7);

        const historyHTML = sortedDates.map(date => {
            const dayData = dailyHydration[date];
            const percentage = Math.min((dayData.total / this.targetHydration) * 100, 100);
            const isToday = date === window.fitnessApp.getToday();

            return `
                <div class="history-item">
                    <div class="history-header">
                        <div class="history-title">
                            ${isToday ? 'Today' : window.fitnessApp.formatDate(date)}
                        </div>
                        <div class="history-date">${dayData.total}ml (${percentage.toFixed(1)}%)</div>
                    </div>
                    <div class="history-details">
                        ${dayData.entries.length} entry(ies): ${dayData.entries.map(entry => 
                            `${entry.amount}ml at ${window.fitnessApp.formatTime(entry.time)}`
                        ).join(', ')}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = historyHTML;
    }

    generateHydrationId() {
        return 'hydration_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get hydration statistics
    getHydrationStats() {
        if (this.hydrationData.length === 0) {
            return {
                totalEntries: 0,
                averageDaily: 0,
                bestDay: null,
                currentStreak: 0,
                targetAchievement: 0
            };
        }

        const totalEntries = this.hydrationData.length;
        
        // Calculate daily averages
        const dailyHydration = {};
        this.hydrationData.forEach(entry => {
            if (!dailyHydration[entry.date]) {
                dailyHydration[entry.date] = 0;
            }
            dailyHydration[entry.date] += entry.amount;
        });

        const dailyTotals = Object.values(dailyHydration);
        const averageDaily = dailyTotals.reduce((sum, total) => sum + total, 0) / dailyTotals.length;

        // Find best day
        const bestDay = Object.keys(dailyHydration).reduce((a, b) => 
            dailyHydration[a] > dailyHydration[b] ? a : b
        );

        // Calculate target achievement rate
        const daysWithTarget = dailyTotals.filter(total => total >= this.targetHydration).length;
        const targetAchievement = (daysWithTarget / dailyTotals.length) * 100;

        return {
            totalEntries,
            averageDaily,
            bestDay: {
                date: bestDay,
                amount: dailyHydration[bestDay]
            },
            currentStreak: this.calculateHydrationStreak(),
            targetAchievement
        };
    }

    calculateHydrationStreak() {
        if (this.hydrationData.length === 0) return 0;

        // Group by date
        const dailyHydration = {};
        this.hydrationData.forEach(entry => {
            if (!dailyHydration[entry.date]) {
                dailyHydration[entry.date] = 0;
            }
            dailyHydration[entry.date] += entry.amount;
        });

        // Sort dates
        const sortedDates = Object.keys(dailyHydration)
            .sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
            const entryDate = new Date(sortedDates[i]);
            entryDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

            if (diffDays === streak && dailyHydration[sortedDates[i]] >= this.targetHydration) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // Get today's hydration summary
    getTodayHydration() {
        const today = window.fitnessApp.getToday();
        const todayEntries = this.hydrationData.filter(entry => entry.date === today);
        const totalAmount = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);
        const percentage = Math.min((totalAmount / this.targetHydration) * 100, 100);

        return {
            entries: todayEntries,
            totalAmount,
            percentage,
            remaining: Math.max(0, this.targetHydration - totalAmount),
            isTargetMet: totalAmount >= this.targetHydration
        };
    }

    // Set custom hydration target
    setHydrationTarget(target) {
        if (target < 500 || target > 5000) {
            throw new Error('Hydration target must be between 500ml and 5000ml');
        }

        this.targetHydration = target;
        this.updateHydrationDisplay();
        window.fitnessApp.showNotification(`Hydration target updated to ${target}ml`, 'success');
    }

    // Get recommended hydration based on profile
    getRecommendedHydration() {
        const profile = window.profileModule.getProfile();
        if (!profile) return this.targetHydration;

        // Basic recommendation: 30ml per kg of body weight
        let recommended = profile.weight * 30;

        // Adjust based on activity level (simplified)
        if (profile.goal === 'improve-endurance') {
            recommended += 500; // More water for endurance training
        }

        // Round to nearest 100ml
        return Math.round(recommended / 100) * 100;
    }

    // Export hydration data
    exportHydrationData() {
        const exportData = {
            hydrationData: this.hydrationData,
            targetHydration: this.targetHydration,
            stats: this.getHydrationStats(),
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }

    // Import hydration data
    importHydrationData(data) {
        try {
            const importData = JSON.parse(data);
            
            if (!importData.hydrationData) {
                throw new Error('Invalid hydration data format');
            }

            this.hydrationData = importData.hydrationData;
            if (importData.targetHydration) {
                this.targetHydration = importData.targetHydration;
            }

            // Save data
            window.fitnessApp.saveData('hydration', this.hydrationData);

            // Update displays
            this.updateHydrationDisplay();
            this.updateHydrationHistory();

            window.fitnessApp.showNotification('Hydration data imported successfully!', 'success');

        } catch (error) {
            throw new Error(`Failed to import hydration data: ${error.message}`);
        }
    }

    // Get hydration insights
    getHydrationInsights() {
        const stats = this.getHydrationStats();
        const today = this.getTodayHydration();
        const insights = [];

        if (stats.averageDaily < this.targetHydration * 0.8) {
            insights.push('Your average daily hydration is below the recommended target. Try to drink more water throughout the day.');
        }

        if (today.percentage < 50) {
            insights.push('You\'re currently below 50% of your daily hydration goal. Consider drinking more water.');
        }

        if (stats.currentStreak > 0) {
            insights.push(`Great job! You've met your hydration goal for ${stats.currentStreak} consecutive day(s).`);
        }

        if (stats.targetAchievement > 80) {
            insights.push('Excellent! You consistently meet your hydration goals.');
        }

        if (today.isTargetMet) {
            insights.push('Congratulations! You\'ve met your hydration goal for today.');
        }

        return insights;
    }
}

// Initialize hydration module
document.addEventListener('DOMContentLoaded', () => {
    window.hydrationModule = new HydrationModule();
});

// Export for use in other modules
window.HydrationModule = HydrationModule;
