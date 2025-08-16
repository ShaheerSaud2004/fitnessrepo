// Nutrition Module
class NutritionModule {
    constructor() {
        this.nutritionData = [];
        this.macroChart = null;
        this.recognition = null;
        this.isListening = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNutritionData();
        this.updateDailyMeals();
        this.initializeMacroChart();
        this.setupSpeechRecognition();
    }

    setupEventListeners() {
        // Nutrition form
        const nutritionForm = document.getElementById('nutrition-form');
        if (nutritionForm) {
            nutritionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addFood();
            });
        }

        // Voice input button
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleVoiceInput();
            });
        }
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButton();
                window.fitnessApp.showNotification('Listening... Speak now!', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceInput(transcript);
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                this.updateVoiceButton();
                window.fitnessApp.showNotification('Voice recognition error: ' + event.error, 'error');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };
        } else {
            const voiceBtn = document.getElementById('voice-input-btn');
            if (voiceBtn) {
                voiceBtn.disabled = true;
                voiceBtn.title = 'Voice recognition not supported';
            }
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            window.fitnessApp.showNotification('Voice recognition not supported in this browser', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voice-input-btn');
        if (!voiceBtn) return;

        if (this.isListening) {
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
            voiceBtn.classList.add('btn-danger');
            voiceBtn.classList.remove('btn-secondary');
        } else {
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Voice Input';
            voiceBtn.classList.remove('btn-danger');
            voiceBtn.classList.add('btn-secondary');
        }
    }

    processVoiceInput(transcript) {
        try {
            // Simple voice parsing - in a real app, you'd use NLP
            const words = transcript.toLowerCase().split(' ');
            
            // Look for food items and numbers
            const foodItems = this.extractFoodItems(words);
            const numbers = this.extractNumbers(transcript);
            
            if (foodItems.length > 0) {
                const foodName = foodItems[0];
                const calories = numbers[0] || 100;
                const protein = numbers[1] || 5;
                const carbs = numbers[2] || 15;
                const fat = numbers[3] || 2;

                // Auto-fill the form
                document.getElementById('food-name').value = foodName;
                document.getElementById('food-calories').value = calories;
                document.getElementById('food-protein').value = protein;
                document.getElementById('food-carbs').value = carbs;
                document.getElementById('food-fat').value = fat;

                window.fitnessApp.showNotification(`Voice input processed: ${foodName}`, 'success');
            } else {
                window.fitnessApp.showNotification('Could not understand food item. Please try again.', 'warning');
            }

        } catch (error) {
            window.fitnessApp.showNotification('Error processing voice input', 'error');
        }
    }

    extractFoodItems(words) {
        const foodKeywords = [
            'apple', 'banana', 'chicken', 'rice', 'bread', 'milk', 'eggs',
            'salmon', 'beef', 'pasta', 'potato', 'carrot', 'broccoli',
            'yogurt', 'cheese', 'nuts', 'peanut butter', 'honey', 'sugar'
        ];

        return words.filter(word => foodKeywords.includes(word));
    }

    extractNumbers(text) {
        const numberRegex = /\d+/g;
        return text.match(numberRegex) || [];
    }

    loadNutritionData() {
        this.nutritionData = window.fitnessApp.getData('nutrition') || [];
    }

    addFood() {
        try {
            const foodName = document.getElementById('food-name').value.trim();
            const calories = parseInt(document.getElementById('food-calories').value);
            const protein = parseFloat(document.getElementById('food-protein').value);
            const carbs = parseFloat(document.getElementById('food-carbs').value);
            const fat = parseFloat(document.getElementById('food-fat').value);

            // Validate inputs
            if (!foodName || !calories || !protein || !carbs || !fat) {
                throw new Error('Please fill in all fields');
            }

            if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
                throw new Error('Values cannot be negative');
            }

            // Create food entry
            const foodEntry = {
                id: this.generateFoodId(),
                name: foodName,
                calories: calories,
                protein: protein,
                carbs: carbs,
                fat: fat,
                date: window.fitnessApp.getToday(),
                time: new Date().toISOString()
            };

            // Add to nutrition data
            this.nutritionData.push(foodEntry);
            window.fitnessApp.saveData('nutrition', this.nutritionData);

            // Update displays
            this.updateDailyMeals();
            this.updateMacroChart();
            this.updateMacroStats();

            // Clear form
            document.getElementById('nutrition-form').reset();

            // Show success message
            window.fitnessApp.showNotification('Food logged successfully!', 'success');

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    updateDailyMeals() {
        const container = document.getElementById('daily-meals');
        if (!container) return;

        const today = window.fitnessApp.getToday();
        const todayMeals = this.nutritionData.filter(meal => meal.date === today);

        if (todayMeals.length === 0) {
            container.innerHTML = '<p class="empty-state">No meals logged today</p>';
            return;
        }

        const mealsHTML = todayMeals.map(meal => `
            <div class="meal-item">
                <div class="meal-header">
                    <div class="meal-name">${meal.name}</div>
                    <div class="meal-time">${window.fitnessApp.formatTime(meal.time)}</div>
                </div>
                <div class="meal-macros">
                    <div class="macro-detail">
                        <div class="macro-detail-label">Calories</div>
                        <div class="macro-detail-value">${meal.calories}</div>
                    </div>
                    <div class="macro-detail">
                        <div class="macro-detail-label">Protein</div>
                        <div class="macro-detail-value">${meal.protein}g</div>
                    </div>
                    <div class="macro-detail">
                        <div class="macro-detail-label">Carbs</div>
                        <div class="macro-detail-value">${meal.carbs}g</div>
                    </div>
                    <div class="macro-detail">
                        <div class="macro-detail-label">Fat</div>
                        <div class="macro-detail-value">${meal.fat}g</div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = mealsHTML;
    }

    initializeMacroChart() {
        const ctx = document.getElementById('macro-chart');
        if (!ctx) return;

        this.macroChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb'
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
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
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
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value}g (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });

        this.updateMacroChart();
    }

    updateMacroChart() {
        if (!this.macroChart) return;

        const today = window.fitnessApp.getToday();
        const todayMeals = this.nutritionData.filter(meal => meal.date === today);

        const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
        const totalFat = todayMeals.reduce((sum, meal) => sum + meal.fat, 0);

        this.macroChart.data.datasets[0].data = [totalProtein, totalCarbs, totalFat];
        this.macroChart.update();
    }

    updateMacroStats() {
        const today = window.fitnessApp.getToday();
        const todayMeals = this.nutritionData.filter(meal => meal.date === today);

        const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
        const totalFat = todayMeals.reduce((sum, meal) => sum + meal.fat, 0);

        document.getElementById('total-calories').textContent = totalCalories;
        document.getElementById('total-protein').textContent = totalProtein + 'g';
        document.getElementById('total-carbs').textContent = totalCarbs + 'g';
        document.getElementById('total-fat').textContent = totalFat + 'g';
    }

    generateFoodId() {
        return 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get nutrition statistics
    getNutritionStats() {
        if (this.nutritionData.length === 0) {
            return {
                totalMeals: 0,
                averageCalories: 0,
                averageProtein: 0,
                averageCarbs: 0,
                averageFat: 0,
                mostLoggedFood: null
            };
        }

        const totalMeals = this.nutritionData.length;
        const totalCalories = this.nutritionData.reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = this.nutritionData.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCarbs = this.nutritionData.reduce((sum, meal) => sum + meal.carbs, 0);
        const totalFat = this.nutritionData.reduce((sum, meal) => sum + meal.fat, 0);

        // Find most logged food
        const foodCounts = {};
        this.nutritionData.forEach(meal => {
            foodCounts[meal.name] = (foodCounts[meal.name] || 0) + 1;
        });

        const mostLoggedFood = Object.keys(foodCounts).reduce((a, b) => 
            foodCounts[a] > foodCounts[b] ? a : b
        );

        return {
            totalMeals,
            averageCalories: totalCalories / totalMeals,
            averageProtein: totalProtein / totalMeals,
            averageCarbs: totalCarbs / totalMeals,
            averageFat: totalFat / totalMeals,
            mostLoggedFood
        };
    }

    // Get today's nutrition summary
    getTodayNutrition() {
        const today = window.fitnessApp.getToday();
        const todayMeals = this.nutritionData.filter(meal => meal.date === today);

        const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
        const totalFat = todayMeals.reduce((sum, meal) => sum + meal.fat, 0);

        return {
            meals: todayMeals,
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat,
            macroRatio: {
                protein: totalProtein * 4 / totalCalories * 100,
                carbs: totalCarbs * 4 / totalCalories * 100,
                fat: totalFat * 9 / totalCalories * 100
            }
        };
    }

    // Calculate recommended macros based on profile
    getRecommendedMacros() {
        const profile = window.profileModule.getProfile();
        if (!profile) return null;

        // Basic BMR calculation using Mifflin-St Jeor Equation
        const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
        const tdee = bmr * 1.2; // Sedentary multiplier

        let targetCalories = tdee;
        let proteinRatio = 0.25;
        let carbsRatio = 0.45;
        let fatRatio = 0.30;

        // Adjust based on goal
        switch (profile.goal) {
            case 'build-muscle':
                targetCalories = tdee + 300;
                proteinRatio = 0.30;
                carbsRatio = 0.50;
                fatRatio = 0.20;
                break;
            case 'lose-fat':
                targetCalories = tdee - 500;
                proteinRatio = 0.35;
                carbsRatio = 0.35;
                fatRatio = 0.30;
                break;
            case 'improve-endurance':
                targetCalories = tdee + 200;
                proteinRatio = 0.20;
                carbsRatio = 0.60;
                fatRatio = 0.20;
                break;
        }

        return {
            calories: Math.round(targetCalories),
            protein: Math.round((targetCalories * proteinRatio) / 4),
            carbs: Math.round((targetCalories * carbsRatio) / 4),
            fat: Math.round((targetCalories * fatRatio) / 9)
        };
    }
}

// Initialize nutrition module
document.addEventListener('DOMContentLoaded', () => {
    window.nutritionModule = new NutritionModule();
});

// Export for use in other modules
window.NutritionModule = NutritionModule;
