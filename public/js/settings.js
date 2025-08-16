// Settings Module
class SettingsModule {
    constructor() {
        this.settings = {};
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings();
    }

    loadSettings() {
        this.settings = window.fitnessApp.getSettings();
    }

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = this.settings.darkMode;
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }

        // Unit system
        const unitSystem = document.getElementById('unit-system');
        if (unitSystem) {
            unitSystem.value = this.settings.unitSystem;
            unitSystem.addEventListener('change', (e) => {
                this.changeUnitSystem(e.target.value);
            });
        }

        // Export data
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportData();
            });
        }

        // Clear data
        const clearBtn = document.getElementById('clear-data-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearData();
            });
        }
    }

    applySettings() {
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Apply unit system
        this.updateUnitDisplay();
    }

    toggleDarkMode(enabled) {
        this.settings.darkMode = enabled;
        window.fitnessApp.saveSettings(this.settings);

        if (enabled) {
            document.body.classList.add('dark-mode');
            window.fitnessApp.showNotification('Dark mode enabled', 'success');
        } else {
            document.body.classList.remove('dark-mode');
            window.fitnessApp.showNotification('Light mode enabled', 'success');
        }
    }

    changeUnitSystem(system) {
        this.settings.unitSystem = system;
        window.fitnessApp.saveSettings(this.settings);
        this.updateUnitDisplay();
        window.fitnessApp.showNotification(`Unit system changed to ${system}`, 'success');
    }

    updateUnitDisplay() {
        // Update form labels and placeholders based on unit system
        const isMetric = this.settings.unitSystem === 'metric';
        
        // Update workout form
        const workoutWeightLabel = document.querySelector('label[for="workout-weight"]');
        if (workoutWeightLabel) {
            workoutWeightLabel.textContent = `Weight (${isMetric ? 'kg' : 'lbs'})`;
        }

        const workoutWeightInput = document.getElementById('workout-weight');
        if (workoutWeightInput) {
            workoutWeightInput.placeholder = isMetric ? 'Enter weight in kg' : 'Enter weight in lbs';
        }

        // Update profile form
        const profileWeightLabel = document.querySelector('label[for="profile-weight"]');
        if (profileWeightLabel) {
            profileWeightLabel.textContent = `Weight (${isMetric ? 'kg' : 'lbs'})`;
        }

        const profileHeightLabel = document.querySelector('label[for="profile-height"]');
        if (profileHeightLabel) {
            profileHeightLabel.textContent = `Height (${isMetric ? 'cm' : 'in'})`;
        }

        // Update dashboard stats
        this.updateDashboardUnits();
    }

    updateDashboardUnits() {
        const isMetric = this.settings.unitSystem === 'metric';
        const totalVolumeElement = document.getElementById('total-volume');
        
        if (totalVolumeElement && window.workoutModule) {
            const stats = window.workoutModule.getWorkoutStats();
            if (stats.totalVolume > 0) {
                let volume = stats.totalVolume;
                let unit = 'kg';
                
                if (!isMetric) {
                    volume = window.fitnessApp.convertWeight(volume, 'kg', 'lbs');
                    unit = 'lbs';
                }
                
                totalVolumeElement.textContent = volume.toFixed(0);
                const labelElement = totalVolumeElement.nextElementSibling;
                if (labelElement) {
                    labelElement.textContent = `Total Volume (${unit})`;
                }
            }
        }
    }

    exportData() {
        try {
            const exportData = {
                user: window.fitnessApp.currentUser,
                settings: this.settings,
                data: {
                    workouts: window.workoutModule ? window.workoutModule.workoutData : [],
                    nutrition: window.nutritionModule ? window.nutritionModule.nutritionData : [],
                    hydration: window.hydrationModule ? window.hydrationModule.hydrationData : [],
                    painFatigue: window.painFatigueModule ? window.painFatigueModule.painFatigueData : [],
                    scheduledEvents: window.schedulingModule ? window.schedulingModule.scheduledEvents : [],
                    habits: window.habitsModule ? window.habitsModule.habits : [],
                    habitProgress: window.habitsModule ? window.habitsModule.habitProgress : {}
                },
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            window.fitnessApp.showNotification('Data exported successfully!', 'success');

        } catch (error) {
            window.fitnessApp.showNotification('Failed to export data: ' + error.message, 'error');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    this.processImportedData(importData);
                } catch (error) {
                    window.fitnessApp.showNotification('Invalid data file: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    processImportedData(importData) {
        try {
            // Validate import data
            if (!importData.data || !importData.user) {
                throw new Error('Invalid data format');
            }

            // Import user data
            if (importData.user) {
                window.fitnessApp.currentUser = importData.user;
                localStorage.setItem('fitnessUserData', JSON.stringify(importData.user));
            }

            // Import settings
            if (importData.settings) {
                this.settings = { ...this.settings, ...importData.settings };
                window.fitnessApp.saveSettings(this.settings);
                this.applySettings();
            }

            // Import module data
            if (importData.data.workouts && window.workoutModule) {
                window.workoutModule.workoutData = importData.data.workouts;
                window.fitnessApp.saveData('workouts', importData.data.workouts);
                window.workoutModule.updateWorkoutHistory();
            }

            if (importData.data.nutrition && window.nutritionModule) {
                window.nutritionModule.nutritionData = importData.data.nutrition;
                window.fitnessApp.saveData('nutrition', importData.data.nutrition);
                window.nutritionModule.updateDailyMeals();
                window.nutritionModule.updateMacroChart();
                window.nutritionModule.updateMacroStats();
            }

            if (importData.data.hydration && window.hydrationModule) {
                window.hydrationModule.hydrationData = importData.data.hydration;
                window.fitnessApp.saveData('hydration', importData.data.hydration);
                window.hydrationModule.updateHydrationDisplay();
                window.hydrationModule.updateHydrationHistory();
            }

            if (importData.data.painFatigue && window.painFatigueModule) {
                window.painFatigueModule.painFatigueData = importData.data.painFatigue;
                window.fitnessApp.saveData('painFatigue', importData.data.painFatigue);
                window.painFatigueModule.updateHistory();
            }

            if (importData.data.scheduledEvents && window.schedulingModule) {
                window.schedulingModule.scheduledEvents = importData.data.scheduledEvents;
                window.fitnessApp.saveData('scheduledEvents', importData.data.scheduledEvents);
                window.schedulingModule.updateScheduledEvents();
            }

            if (importData.data.habits && window.habitsModule) {
                window.habitsModule.habits = importData.data.habits;
                window.habitsModule.habitProgress = importData.data.habitProgress || {};
                window.fitnessApp.saveData('habits', importData.data.habits);
                window.fitnessApp.saveData('habitProgress', importData.data.habitProgress || {});
                window.habitsModule.updateTodayHabits();
                window.habitsModule.updateHabitProgress();
            }

            // Update dashboard
            if (window.dashboardModule) {
                window.dashboardModule.refresh();
            }

            window.fitnessApp.showNotification('Data imported successfully!', 'success');

        } catch (error) {
            window.fitnessApp.showNotification('Failed to import data: ' + error.message, 'error');
        }
    }

    clearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            try {
                // Clear all localStorage data
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes(window.fitnessApp.currentUser?.id || '')) {
                        keysToRemove.push(key);
                    }
                }

                keysToRemove.forEach(key => localStorage.removeItem(key));

                // Reset module data
                if (window.workoutModule) {
                    window.workoutModule.workoutData = [];
                    window.workoutModule.updateWorkoutHistory();
                }

                if (window.nutritionModule) {
                    window.nutritionModule.nutritionData = [];
                    window.nutritionModule.updateDailyMeals();
                    window.nutritionModule.updateMacroChart();
                    window.nutritionModule.updateMacroStats();
                }

                if (window.hydrationModule) {
                    window.hydrationModule.hydrationData = [];
                    window.hydrationModule.updateHydrationDisplay();
                    window.hydrationModule.updateHydrationHistory();
                }

                if (window.painFatigueModule) {
                    window.painFatigueModule.painFatigueData = [];
                    window.painFatigueModule.updateHistory();
                }

                if (window.schedulingModule) {
                    window.schedulingModule.scheduledEvents = [];
                    window.schedulingModule.updateScheduledEvents();
                }

                if (window.habitsModule) {
                    window.habitsModule.habits = [];
                    window.habitsModule.habitProgress = {};
                    window.habitsModule.updateTodayHabits();
                    window.habitsModule.updateHabitProgress();
                }

                // Update dashboard
                if (window.dashboardModule) {
                    window.dashboardModule.refresh();
                }

                window.fitnessApp.showNotification('All data cleared successfully!', 'success');

            } catch (error) {
                window.fitnessApp.showNotification('Failed to clear data: ' + error.message, 'error');
            }
        }
    }

    // Get current settings
    getSettings() {
        return this.settings;
    }

    // Update a specific setting
    updateSetting(key, value) {
        this.settings[key] = value;
        window.fitnessApp.saveSettings(this.settings);
        this.applySettings();
    }

    // Reset settings to defaults
    resetSettings() {
        this.settings = {
            darkMode: false,
            unitSystem: 'metric'
        };
        window.fitnessApp.saveSettings(this.settings);
        this.applySettings();
        this.setupEventListeners();
        window.fitnessApp.showNotification('Settings reset to defaults', 'success');
    }

    // Get data usage statistics
    getDataUsageStats() {
        const stats = {
            totalSize: 0,
            modules: {}
        };

        try {
            // Calculate localStorage usage
            const userData = window.fitnessApp.currentUser;
            if (userData) {
                const userKey = userData.id;
                
                // Check each module's data
                const modules = ['workouts', 'nutrition', 'hydration', 'painFatigue', 'scheduledEvents', 'habits', 'habitProgress'];
                
                modules.forEach(module => {
                    const data = window.fitnessApp.getData(module);
                    if (data) {
                        const size = JSON.stringify(data).length;
                        stats.modules[module] = {
                            size: size,
                            count: Array.isArray(data) ? data.length : Object.keys(data).length
                        };
                        stats.totalSize += size;
                    }
                });
            }
        } catch (error) {
            console.error('Error calculating data usage:', error);
        }

        return stats;
    }

    // Export settings only
    exportSettings() {
        try {
            const settingsData = {
                settings: this.settings,
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(settingsData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `fitness-settings-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            window.fitnessApp.showNotification('Settings exported successfully!', 'success');

        } catch (error) {
            window.fitnessApp.showNotification('Failed to export settings: ' + error.message, 'error');
        }
    }

    // Import settings only
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    if (importData.settings) {
                        this.settings = { ...this.settings, ...importData.settings };
                        window.fitnessApp.saveSettings(this.settings);
                        this.applySettings();
                        this.setupEventListeners();
                        window.fitnessApp.showNotification('Settings imported successfully!', 'success');
                    } else {
                        throw new Error('No settings found in file');
                    }
                } catch (error) {
                    window.fitnessApp.showNotification('Invalid settings file: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }
}

// Initialize settings module
document.addEventListener('DOMContentLoaded', () => {
    window.settingsModule = new SettingsModule();
});

// Export for use in other modules
window.SettingsModule = SettingsModule;
