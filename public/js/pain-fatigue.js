// Pain & Fatigue Module
class PainFatigueModule {
    constructor() {
        this.painFatigueData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPainFatigueData();
        this.updateHistory();
        this.setupSliders();
    }

    setupEventListeners() {
        // Energy form
        const energyForm = document.getElementById('energy-form');
        if (energyForm) {
            energyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.logEnergyLevel();
            });
        }

        // Pain form
        const painForm = document.getElementById('pain-form');
        if (painForm) {
            painForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.logPain();
            });
        }
    }

    setupSliders() {
        // Energy level slider
        const energySlider = document.getElementById('energy-level');
        const energyValue = document.getElementById('energy-value');
        if (energySlider && energyValue) {
            energySlider.addEventListener('input', (e) => {
                energyValue.textContent = e.target.value;
            });
        }

        // Pain intensity slider
        const painSlider = document.getElementById('pain-intensity');
        const painValue = document.getElementById('pain-value');
        if (painSlider && painValue) {
            painSlider.addEventListener('input', (e) => {
                painValue.textContent = e.target.value;
            });
        }
    }

    loadPainFatigueData() {
        this.painFatigueData = window.fitnessApp.getData('painFatigue') || [];
    }

    logEnergyLevel() {
        try {
            const energyLevel = parseInt(document.getElementById('energy-level').value);

            if (energyLevel < 0 || energyLevel > 10) {
                throw new Error('Energy level must be between 0 and 10');
            }

            // Create energy entry
            const energyEntry = {
                id: this.generateEntryId(),
                type: 'energy',
                level: energyLevel,
                date: window.fitnessApp.getToday(),
                time: new Date().toISOString()
            };

            // Add to data
            this.painFatigueData.push(energyEntry);
            window.fitnessApp.saveData('painFatigue', this.painFatigueData);

            // Update display
            this.updateHistory();

            // Show success message
            const energyDescriptions = [
                'Exhausted', 'Very Tired', 'Tired', 'Somewhat Tired', 'Neutral',
                'Somewhat Energized', 'Energized', 'Very Energized', 'Highly Energized', 'Peak Energy', 'Super Energized'
            ];
            window.fitnessApp.showNotification(
                `Energy level logged: ${energyLevel}/10 - ${energyDescriptions[energyLevel]}`, 
                'success'
            );

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    logPain() {
        try {
            const location = document.getElementById('pain-location').value.trim();
            const intensity = parseInt(document.getElementById('pain-intensity').value);
            const notes = document.getElementById('pain-notes').value.trim();

            if (!location) {
                throw new Error('Please specify pain location');
            }

            if (intensity < 1 || intensity > 10) {
                throw new Error('Pain intensity must be between 1 and 10');
            }

            // Create pain entry
            const painEntry = {
                id: this.generateEntryId(),
                type: 'pain',
                location: location,
                intensity: intensity,
                notes: notes,
                date: window.fitnessApp.getToday(),
                time: new Date().toISOString()
            };

            // Add to data
            this.painFatigueData.push(painEntry);
            window.fitnessApp.saveData('painFatigue', this.painFatigueData);

            // Update display
            this.updateHistory();

            // Clear form
            document.getElementById('pain-form').reset();
            document.getElementById('pain-value').textContent = '5';

            // Show success message
            const intensityDescriptions = [
                '', 'Very Mild', 'Mild', 'Moderate', 'Moderate', 'Moderate',
                'Moderate-Severe', 'Severe', 'Very Severe', 'Extreme', 'Unbearable'
            ];
            window.fitnessApp.showNotification(
                `Pain logged: ${location} - ${intensity}/10 (${intensityDescriptions[intensity]})`, 
                'success'
            );

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    updateHistory() {
        const container = document.getElementById('pain-fatigue-history');
        if (!container) return;

        if (this.painFatigueData.length === 0) {
            container.innerHTML = '<p class="empty-state">No pain or fatigue data logged yet</p>';
            return;
        }

        // Sort by date (newest first) and take last 10 entries
        const sortedEntries = this.painFatigueData
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 10);

        const historyHTML = sortedEntries.map(entry => {
            const isToday = entry.date === window.fitnessApp.getToday();
            
            if (entry.type === 'energy') {
                const energyDescriptions = [
                    'Exhausted', 'Very Tired', 'Tired', 'Somewhat Tired', 'Neutral',
                    'Somewhat Energized', 'Energized', 'Very Energized', 'Highly Energized', 'Peak Energy', 'Super Energized'
                ];
                
                return `
                    <div class="history-item">
                        <div class="history-header">
                            <div class="history-title">
                                <i class="fas fa-battery-half"></i> Energy Level: ${entry.level}/10
                            </div>
                            <div class="history-date">
                                ${isToday ? 'Today' : window.fitnessApp.formatDate(entry.date)} at ${window.fitnessApp.formatTime(entry.time)}
                            </div>
                        </div>
                        <div class="history-details">
                            ${energyDescriptions[entry.level]}
                        </div>
                    </div>
                `;
            } else {
                const intensityDescriptions = [
                    '', 'Very Mild', 'Mild', 'Moderate', 'Moderate', 'Moderate',
                    'Moderate-Severe', 'Severe', 'Very Severe', 'Extreme', 'Unbearable'
                ];
                
                return `
                    <div class="history-item">
                        <div class="history-header">
                            <div class="history-title">
                                <i class="fas fa-exclamation-triangle"></i> Pain: ${entry.location}
                            </div>
                            <div class="history-date">
                                ${isToday ? 'Today' : window.fitnessApp.formatDate(entry.date)} at ${window.fitnessApp.formatTime(entry.time)}
                            </div>
                        </div>
                        <div class="history-details">
                            Intensity: ${entry.intensity}/10 (${intensityDescriptions[entry.intensity]})
                            ${entry.notes ? `<br>Notes: ${entry.notes}` : ''}
                        </div>
                    </div>
                `;
            }
        }).join('');

        container.innerHTML = historyHTML;
    }

    generateEntryId() {
        return 'pain_fatigue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get pain & fatigue statistics
    getPainFatigueStats() {
        if (this.painFatigueData.length === 0) {
            return {
                totalEntries: 0,
                averageEnergy: 0,
                energyTrend: 'stable',
                painFrequency: 0,
                mostCommonPainLocation: null,
                recentEnergyLevel: null
            };
        }

        const totalEntries = this.painFatigueData.length;
        const energyEntries = this.painFatigueData.filter(entry => entry.type === 'energy');
        const painEntries = this.painFatigueData.filter(entry => entry.type === 'pain');

        // Calculate average energy
        const averageEnergy = energyEntries.length > 0 
            ? energyEntries.reduce((sum, entry) => sum + entry.level, 0) / energyEntries.length 
            : 0;

        // Calculate energy trend (last 7 days vs previous 7 days)
        const energyTrend = this.calculateEnergyTrend(energyEntries);

        // Calculate pain frequency (percentage of days with pain in last 30 days)
        const painFrequency = this.calculatePainFrequency(painEntries);

        // Find most common pain location
        const painLocationCounts = {};
        painEntries.forEach(entry => {
            painLocationCounts[entry.location] = (painLocationCounts[entry.location] || 0) + 1;
        });

        const mostCommonPainLocation = Object.keys(painLocationCounts).length > 0
            ? Object.keys(painLocationCounts).reduce((a, b) => 
                painLocationCounts[a] > painLocationCounts[b] ? a : b
            )
            : null;

        // Get recent energy level
        const recentEnergyEntry = energyEntries
            .sort((a, b) => new Date(b.time) - new Date(a.time))[0];
        const recentEnergyLevel = recentEnergyEntry ? recentEnergyEntry.level : null;

        return {
            totalEntries,
            averageEnergy,
            energyTrend,
            painFrequency,
            mostCommonPainLocation,
            recentEnergyLevel
        };
    }

    calculateEnergyTrend(energyEntries) {
        if (energyEntries.length < 14) return 'insufficient_data';

        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

        const recentEntries = energyEntries.filter(entry => 
            new Date(entry.time) >= sevenDaysAgo
        );
        const previousEntries = energyEntries.filter(entry => 
            new Date(entry.time) >= fourteenDaysAgo && new Date(entry.time) < sevenDaysAgo
        );

        if (recentEntries.length === 0 || previousEntries.length === 0) {
            return 'insufficient_data';
        }

        const recentAverage = recentEntries.reduce((sum, entry) => sum + entry.level, 0) / recentEntries.length;
        const previousAverage = previousEntries.reduce((sum, entry) => sum + entry.level, 0) / previousEntries.length;

        const difference = recentAverage - previousAverage;

        if (difference > 1) return 'improving';
        if (difference < -1) return 'declining';
        return 'stable';
    }

    calculatePainFrequency(painEntries) {
        if (painEntries.length === 0) return 0;

        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentPainEntries = painEntries.filter(entry => 
            new Date(entry.time) >= thirtyDaysAgo
        );

        if (recentPainEntries.length === 0) return 0;

        // Count unique days with pain
        const daysWithPain = new Set();
        recentPainEntries.forEach(entry => {
            daysWithPain.add(entry.date);
        });

        return (daysWithPain.size / 30) * 100; // Percentage of days with pain
    }

    // Get today's summary
    getTodaySummary() {
        const today = window.fitnessApp.getToday();
        const todayEntries = this.painFatigueData.filter(entry => entry.date === today);

        const energyEntry = todayEntries.find(entry => entry.type === 'energy');
        const painEntries = todayEntries.filter(entry => entry.type === 'pain');

        return {
            energyLevel: energyEntry ? energyEntry.level : null,
            painEntries: painEntries,
            hasPain: painEntries.length > 0,
            averagePainIntensity: painEntries.length > 0 
                ? painEntries.reduce((sum, entry) => sum + entry.intensity, 0) / painEntries.length 
                : 0
        };
    }

    // Get insights and recommendations
    getInsights() {
        const stats = this.getPainFatigueStats();
        const today = this.getTodaySummary();
        const insights = [];

        // Energy insights
        if (stats.averageEnergy < 4) {
            insights.push('Your average energy level is quite low. Consider getting more sleep, reducing stress, or consulting a healthcare provider.');
        } else if (stats.averageEnergy > 7) {
            insights.push('Great! You maintain high energy levels consistently.');
        }

        if (stats.energyTrend === 'declining') {
            insights.push('Your energy levels have been declining recently. Consider taking a rest day or reducing workout intensity.');
        } else if (stats.energyTrend === 'improving') {
            insights.push('Excellent! Your energy levels are improving.');
        }

        // Pain insights
        if (stats.painFrequency > 30) {
            insights.push('You\'re experiencing pain frequently. Consider consulting a healthcare provider or physical therapist.');
        }

        if (stats.mostCommonPainLocation) {
            insights.push(`Your most common pain location is ${stats.mostCommonPainLocation}. Consider targeted stretching or strengthening exercises.`);
        }

        // Today-specific insights
        if (today.energyLevel !== null) {
            if (today.energyLevel < 3) {
                insights.push('Your energy is very low today. Consider a light workout or rest day.');
            } else if (today.energyLevel > 8) {
                insights.push('You have high energy today! Great time for an intense workout.');
            }
        }

        if (today.hasPain && today.averagePainIntensity > 7) {
            insights.push('You\'re experiencing severe pain today. Consider rest and consult a healthcare provider if it persists.');
        }

        return insights;
    }

    // Get recovery recommendations
    getRecoveryRecommendations() {
        const stats = this.getPainFatigueStats();
        const today = this.getTodaySummary();
        const recommendations = [];

        // Energy-based recommendations
        if (stats.averageEnergy < 4) {
            recommendations.push('Prioritize sleep (7-9 hours per night)');
            recommendations.push('Consider stress management techniques');
            recommendations.push('Reduce workout intensity temporarily');
        }

        if (stats.energyTrend === 'declining') {
            recommendations.push('Take 1-2 rest days this week');
            recommendations.push('Focus on light stretching and mobility work');
            recommendations.push('Ensure adequate nutrition and hydration');
        }

        // Pain-based recommendations
        if (stats.painFrequency > 20) {
            recommendations.push('Consider consulting a physical therapist');
            recommendations.push('Implement a proper warm-up routine');
            recommendations.push('Focus on form and technique in exercises');
        }

        if (stats.mostCommonPainLocation) {
            recommendations.push(`Add specific exercises for ${stats.mostCommonPainLocation}`);
            recommendations.push('Consider foam rolling or massage');
            recommendations.push('Gradually increase load and intensity');
        }

        // Today-specific recommendations
        if (today.energyLevel !== null && today.energyLevel < 4) {
            recommendations.push('Today: Focus on light cardio or yoga');
            recommendations.push('Today: Prioritize recovery and rest');
        }

        if (today.hasPain && today.averagePainIntensity > 6) {
            recommendations.push('Today: Avoid exercises that aggravate the pain');
            recommendations.push('Today: Consider ice/heat therapy');
            recommendations.push('Today: Monitor pain and seek medical attention if severe');
        }

        return recommendations;
    }

    // Export pain & fatigue data
    exportPainFatigueData() {
        const exportData = {
            painFatigueData: this.painFatigueData,
            stats: this.getPainFatigueStats(),
            insights: this.getInsights(),
            recommendations: this.getRecoveryRecommendations(),
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }

    // Import pain & fatigue data
    importPainFatigueData(data) {
        try {
            const importData = JSON.parse(data);
            
            if (!importData.painFatigueData) {
                throw new Error('Invalid pain & fatigue data format');
            }

            this.painFatigueData = importData.painFatigueData;

            // Save data
            window.fitnessApp.saveData('painFatigue', this.painFatigueData);

            // Update display
            this.updateHistory();

            window.fitnessApp.showNotification('Pain & fatigue data imported successfully!', 'success');

        } catch (error) {
            throw new Error(`Failed to import pain & fatigue data: ${error.message}`);
        }
    }
}

// Initialize pain & fatigue module
document.addEventListener('DOMContentLoaded', () => {
    window.painFatigueModule = new PainFatigueModule();
});

// Export for use in other modules
window.PainFatigueModule = PainFatigueModule;
