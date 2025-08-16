// Profile Module
class ProfileModule {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProfile();
    }

    setupEventListeners() {
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Handle height input synchronization
        this.setupHeightInputSync();
    }

    setupHeightInputSync() {
        const heightCm = document.getElementById('profile-height-cm');
        const heightFeet = document.getElementById('profile-height-feet');
        const heightInches = document.getElementById('profile-height-inches');

        if (heightCm) {
            heightCm.addEventListener('input', () => {
                if (heightCm.value) {
                    // Clear feet/inches when cm is entered
                    heightFeet.value = '';
                    heightInches.value = '';
                }
            });
        }

        if (heightFeet || heightInches) {
            [heightFeet, heightInches].forEach(input => {
                if (input) {
                    input.addEventListener('input', () => {
                        if (heightFeet.value || heightInches.value) {
                            // Clear cm when feet/inches is entered
                            heightCm.value = '';
                        }
                    });
                }
            });
        }
    }

    loadProfile() {
        const user = window.fitnessApp.currentUser;
        if (!user) return;

        // Load profile data
        const profile = user.profile || {};
        
        // Populate form fields
        const fields = [
            'profile-name',
            'profile-age',
            'profile-weight',
            'profile-goal',
            'profile-experience',
            'profile-medical'
        ];

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && profile[fieldId.replace('profile-', '')] !== undefined) {
                field.value = profile[fieldId.replace('profile-', '')];
            }
        });

        // Handle height input (convert cm to feet/inches if needed)
        if (profile.height) {
            const heightCm = profile.height;
            document.getElementById('profile-height-cm').value = heightCm;
            
            // Also populate feet/inches for convenience
            const totalInches = Math.round(heightCm / 2.54);
            const feet = Math.floor(totalInches / 12);
            const inches = totalInches % 12;
            
            document.getElementById('profile-height-feet').value = feet;
            document.getElementById('profile-height-inches').value = inches;
        }
    }

    async saveProfile() {
        try {
            const formData = this.getFormData();
            
            // Validate form data
            this.validateFormData(formData);

            // Update user profile
            const user = window.fitnessApp.currentUser;
            user.profile = formData;

            // Save to localStorage
            window.fitnessApp.saveData('userData', user);
            
            // Update users array
            const users = window.authModule.getUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = user;
                window.authModule.saveUsers(users);
            }

            // Update current user
            window.fitnessApp.currentUser = user;
            localStorage.setItem('fitnessUserData', JSON.stringify(user));

            // Show success message
            window.fitnessApp.showNotification('Profile saved successfully!', 'success');

            // Update workout generator visibility
            this.updateWorkoutGeneratorVisibility();

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    getFormData() {
        // Handle height input (cm or feet/inches)
        let height = null;
        const heightCm = document.getElementById('profile-height-cm').value;
        const heightFeet = document.getElementById('profile-height-feet').value;
        const heightInches = document.getElementById('profile-height-inches').value;

        if (heightCm) {
            height = parseInt(heightCm);
        } else if (heightFeet && heightInches) {
            // Convert feet and inches to cm
            const totalInches = (parseInt(heightFeet) * 12) + parseInt(heightInches);
            height = Math.round(totalInches * 2.54);
        }

        return {
            name: document.getElementById('profile-name').value.trim(),
            age: parseInt(document.getElementById('profile-age').value),
            weight: parseFloat(document.getElementById('profile-weight').value),
            height: height,
            goal: document.getElementById('profile-goal').value,
            experience: document.getElementById('profile-experience').value,
            medical: document.getElementById('profile-medical').value.trim()
        };
    }

    validateFormData(data) {
        if (!data.name || data.name.length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (!data.height) {
            throw new Error('Please enter your height in either centimeters or feet and inches');
        }

        if (data.height < 100 || data.height > 250) {
            throw new Error('Please enter a valid height between 100-250 cm');
        }

        if (!data.age || data.age < 13 || data.age > 120) {
            throw new Error('Age must be between 13 and 120');
        }

        if (!data.weight || data.weight < 20 || data.weight > 500) {
            throw new Error('Weight must be between 20 and 500 kg');
        }

        if (!data.height || data.height < 100 || data.height > 250) {
            throw new Error('Height must be between 100 and 250 cm');
        }

        if (!data.goal) {
            throw new Error('Please select a fitness goal');
        }

        if (!data.experience) {
            throw new Error('Please select your experience level');
        }
    }

    updateWorkoutGeneratorVisibility() {
        const profileCheck = document.getElementById('profile-check');
        const workoutGenerator = document.getElementById('workout-generator');

        if (this.isProfileComplete()) {
            if (profileCheck) profileCheck.classList.add('hidden');
            if (workoutGenerator) workoutGenerator.classList.remove('hidden');
        } else {
            if (profileCheck) profileCheck.classList.remove('hidden');
            if (workoutGenerator) workoutGenerator.classList.add('hidden');
        }
    }

    isProfileComplete() {
        const user = window.fitnessApp.currentUser;
        if (!user || !user.profile) return false;

        const profile = user.profile;
        const requiredFields = ['name', 'age', 'weight', 'height', 'goal', 'experience'];

        return requiredFields.every(field => {
            const value = profile[field];
            return value !== null && value !== undefined && value !== '';
        });
    }

    getProfile() {
        const user = window.fitnessApp.currentUser;
        return user ? user.profile : null;
    }

    // Utility methods for other modules
    getUserGoal() {
        const profile = this.getProfile();
        return profile ? profile.goal : null;
    }

    getUserExperience() {
        const profile = this.getProfile();
        return profile ? profile.experience : null;
    }

    getUserMedicalInfo() {
        const profile = this.getProfile();
        return profile ? profile.medical : '';
    }

    getUserStats() {
        const profile = this.getProfile();
        if (!profile) return null;

        return {
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            bmi: this.calculateBMI(profile.weight, profile.height)
        };
    }

    calculateBMI(weight, height) {
        // BMI = weight (kg) / height (m)²
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
    }

    getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    // Method to check if user has medical limitations
    hasMedicalLimitations() {
        const medicalInfo = this.getUserMedicalInfo();
        if (!medicalInfo) return false;

        const limitations = [
            'injury', 'pain', 'surgery', 'condition', 'disability',
            'heart', 'back', 'knee', 'shoulder', 'wrist', 'ankle'
        ];

        return limitations.some(limitation => 
            medicalInfo.toLowerCase().includes(limitation)
        );
    }

    // Method to get exercise recommendations based on limitations
    getExerciseRecommendations() {
        const medicalInfo = this.getUserMedicalInfo();
        if (!medicalInfo) return [];

        const recommendations = [];

        if (medicalInfo.toLowerCase().includes('back')) {
            recommendations.push('Avoid heavy deadlifts and squats');
            recommendations.push('Focus on core strengthening exercises');
            recommendations.push('Consider low-impact cardio');
        }

        if (medicalInfo.toLowerCase().includes('knee')) {
            recommendations.push('Avoid high-impact exercises');
            recommendations.push('Focus on swimming or cycling');
            recommendations.push('Include knee-strengthening exercises');
        }

        if (medicalInfo.toLowerCase().includes('shoulder')) {
            recommendations.push('Avoid overhead presses initially');
            recommendations.push('Focus on rotator cuff exercises');
            recommendations.push('Gradually increase shoulder work');
        }

        return recommendations;
    }

    // Method to export profile data
    exportProfile() {
        const profile = this.getProfile();
        if (!profile) {
            throw new Error('No profile data to export');
        }

        const exportData = {
            profile: profile,
            stats: this.getUserStats(),
            recommendations: this.getExerciseRecommendations(),
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }

    // Method to import profile data
    importProfile(data) {
        try {
            const importData = JSON.parse(data);
            
            if (!importData.profile) {
                throw new Error('Invalid profile data format');
            }

            // Validate imported data
            this.validateFormData(importData.profile);

            // Update profile
            const user = window.fitnessApp.currentUser;
            user.profile = importData.profile;

            // Save data
            window.fitnessApp.saveData('userData', user);
            
            // Update users array
            const users = window.authModule.getUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = user;
                window.authModule.saveUsers(users);
            }

            // Reload profile
            this.loadProfile();
            
            window.fitnessApp.showNotification('Profile imported successfully!', 'success');

        } catch (error) {
            throw new Error(`Failed to import profile: ${error.message}`);
        }
    }
}

// Initialize profile module
document.addEventListener('DOMContentLoaded', () => {
    window.profileModule = new ProfileModule();
});

// Export for use in other modules
window.ProfileModule = ProfileModule;
