// Main Application Controller
class FitnessApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.checkAuthentication();
        this.applySettings();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Profile check links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page);
            });
        });
    }

    loadUserData() {
        const userData = localStorage.getItem('fitnessUserData');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    checkAuthentication() {
        const token = localStorage.getItem('fitnessToken');
        if (token && this.currentUser) {
            this.showApp();
        } else {
            this.showAuth();
        }
    }

    showAuth() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }

    showApp() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        this.navigateToPage(this.currentPage);
    }

    navigateToPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        
        // Show selected page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            
            // Add active class to nav item
            const navItem = document.querySelector(`[data-page="${page}"]`);
            if (navItem) {
                navItem.classList.add('active');
            }
            
            // Trigger page-specific initialization
            this.initializePage(page);
        }
    }

    initializePage(page) {
        switch (page) {
            case 'dashboard':
                if (window.dashboardModule) {
                    window.dashboardModule.init();
                }
                break;
            case 'profile':
                if (window.profileModule) {
                    window.profileModule.init();
                }
                break;
            case 'workout':
                if (window.workoutModule) {
                    window.workoutModule.init();
                }
                break;
            case 'nutrition':
                if (window.nutritionModule) {
                    window.nutritionModule.init();
                }
                break;
            case 'hydration':
                if (window.hydrationModule) {
                    window.hydrationModule.init();
                }
                break;
            case 'pain-fatigue':
                if (window.painFatigueModule) {
                    window.painFatigueModule.init();
                }
                break;
            case 'scheduling':
                if (window.schedulingModule) {
                    window.schedulingModule.init();
                }
                break;
            case 'habits':
                if (window.habitsModule) {
                    window.habitsModule.init();
                }
                break;
            case 'ai-coach':
                if (window.aiCoachModule) {
                    window.aiCoachModule.init();
                }
                break;
            case 'settings':
                if (window.settingsModule) {
                    window.settingsModule.init();
                }
                break;
        }
    }

    logout() {
        localStorage.removeItem('fitnessToken');
        localStorage.removeItem('fitnessUserData');
        this.currentUser = null;
        this.showAuth();
        this.showNotification('Logged out successfully', 'success');
    }

    applySettings() {
        const settings = this.getSettings();
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    getSettings() {
        const settings = localStorage.getItem('fitnessSettings');
        return settings ? JSON.parse(settings) : {
            darkMode: false,
            unitSystem: 'metric'
        };
    }

    saveSettings(settings) {
        localStorage.setItem('fitnessSettings', JSON.stringify(settings));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Utility methods
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }

    getToday() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // Data persistence methods
    saveData(key, data) {
        const userKey = this.currentUser ? `${this.currentUser.id}_${key}` : key;
        localStorage.setItem(userKey, JSON.stringify(data));
    }

    getData(key) {
        const userKey = this.currentUser ? `${this.currentUser.id}_${key}` : key;
        const data = localStorage.getItem(userKey);
        return data ? JSON.parse(data) : null;
    }

    // Unit conversion methods
    convertWeight(weight, fromUnit, toUnit) {
        if (fromUnit === toUnit) return weight;
        
        if (fromUnit === 'kg' && toUnit === 'lbs') {
            return weight * 2.20462;
        } else if (fromUnit === 'lbs' && toUnit === 'kg') {
            return weight / 2.20462;
        }
        
        return weight;
    }

    convertHeight(height, fromUnit, toUnit) {
        if (fromUnit === toUnit) return height;
        
        if (fromUnit === 'cm' && toUnit === 'in') {
            return height / 2.54;
        } else if (fromUnit === 'in' && toUnit === 'cm') {
            return height * 2.54;
        }
        
        return height;
    }

    // Validation methods
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        this.showNotification(`An error occurred: ${error.message}`, 'error');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fitnessApp = new FitnessApp();
});

// Export for use in other modules
window.FitnessApp = FitnessApp;
