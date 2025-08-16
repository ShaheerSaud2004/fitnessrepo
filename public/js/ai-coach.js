// AI Coach Module
class AICoachModule {
    constructor() {
        this.coachMessages = [];
        this.init();
    }

    init() {
        this.updateCoachMessage();
        this.updatePerformanceAnalysis();
        this.updateRecommendations();
    }

    updateCoachMessage() {
        const container = document.getElementById('coach-message');
        if (!container) return;

        const profile = window.profileModule.getProfile();
        const today = new Date();
        const timeOfDay = today.getHours();

        let greeting = '';
        if (timeOfDay < 12) {
            greeting = 'Good morning';
        } else if (timeOfDay < 17) {
            greeting = 'Good afternoon';
        } else {
            greeting = 'Good evening';
        }

        let message = '';
        if (!profile) {
            message = `${greeting}! I'm your AI fitness coach. I'll analyze your data and provide personalized recommendations to help you reach your goals. First, please complete your profile so I can give you better guidance.`;
        } else {
            const name = profile.name || 'there';
            const goal = this.getGoalDescription(profile.goal);
            message = `${greeting}, ${name}! I'm here to help you ${goal}. I've analyzed your recent activity and have some insights to share. Let me know if you have any questions!`;
        }

        const messageHTML = `
            <div class="coach-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;

        container.innerHTML = messageHTML;
    }

    getGoalDescription(goal) {
        const goalDescriptions = {
            'build-muscle': 'build strength and muscle mass',
            'lose-fat': 'lose fat and get leaner',
            'improve-endurance': 'improve your cardiovascular endurance'
        };
        return goalDescriptions[goal] || 'achieve your fitness goals';
    }

    updatePerformanceAnalysis() {
        const container = document.getElementById('performance-analysis');
        if (!container) return;

        const profile = window.profileModule.getProfile();
        if (!profile) {
            container.innerHTML = '<p class="empty-state">Complete your profile and log some workouts to get personalized analysis</p>';
            return;
        }

        const analysis = this.generatePerformanceAnalysis();
        
        const analysisHTML = analysis.map(item => `
            <div class="analysis-item">
                <div class="analysis-title">${item.title}</div>
                <div class="analysis-content">${item.content}</div>
            </div>
        `).join('');

        container.innerHTML = analysisHTML;
    }

    generatePerformanceAnalysis() {
        const analysis = [];
        const profile = window.profileModule.getProfile();
        const workoutStats = window.workoutModule ? window.workoutModule.getWorkoutStats() : null;
        const nutritionStats = window.nutritionModule ? window.nutritionModule.getNutritionStats() : null;
        const hydrationStats = window.hydrationModule ? window.hydrationModule.getHydrationStats() : null;
        const painFatigueStats = window.painFatigueModule ? window.painFatigueModule.getPainFatigueStats() : null;
        const habitsStats = window.habitsModule ? window.habitsModule.getHabitsStats() : null;

        // Workout Analysis
        if (workoutStats && workoutStats.totalWorkouts > 0) {
            const workoutAnalysis = this.analyzeWorkoutPerformance(workoutStats, profile);
            analysis.push(workoutAnalysis);
        } else {
            analysis.push({
                title: 'Workout Performance',
                content: 'No workout data available yet. Start logging your workouts to get performance insights!'
            });
        }

        // Nutrition Analysis
        if (nutritionStats && nutritionStats.totalMeals > 0) {
            const nutritionAnalysis = this.analyzeNutritionPerformance(nutritionStats, profile);
            analysis.push(nutritionAnalysis);
        } else {
            analysis.push({
                title: 'Nutrition Tracking',
                content: 'No nutrition data logged yet. Start tracking your meals for personalized nutrition insights!'
            });
        }

        // Hydration Analysis
        if (hydrationStats && hydrationStats.totalEntries > 0) {
            const hydrationAnalysis = this.analyzeHydrationPerformance(hydrationStats);
            analysis.push(hydrationAnalysis);
        } else {
            analysis.push({
                title: 'Hydration Status',
                content: 'No hydration data logged yet. Start tracking your water intake for better health insights!'
            });
        }

        // Recovery Analysis
        if (painFatigueStats && painFatigueStats.totalEntries > 0) {
            const recoveryAnalysis = this.analyzeRecoveryPerformance(painFatigueStats);
            analysis.push(recoveryAnalysis);
        } else {
            analysis.push({
                title: 'Recovery & Energy',
                content: 'No energy or pain data logged yet. Track your daily energy levels and any pain for recovery insights!'
            });
        }

        // Habits Analysis
        if (habitsStats && habitsStats.totalHabits > 0) {
            const habitsAnalysis = this.analyzeHabitsPerformance(habitsStats);
            analysis.push(habitsAnalysis);
        } else {
            analysis.push({
                title: 'Habit Consistency',
                content: 'No habits created yet. Start building healthy fitness habits for long-term success!'
            });
        }

        return analysis;
    }

    analyzeWorkoutPerformance(stats, profile) {
        let content = '';
        const goal = profile.goal;

        // Volume analysis
        if (stats.totalVolume > 0) {
            const avgVolume = stats.averageVolume;
            content += `Your average workout volume is ${avgVolume.toFixed(0)} kg. `;
            
            if (goal === 'build-muscle') {
                if (avgVolume > 1000) {
                    content += 'Excellent volume for muscle building! ';
                } else if (avgVolume > 500) {
                    content += 'Good volume, consider gradually increasing for better muscle gains. ';
                } else {
                    content += 'Focus on progressive overload to increase volume for muscle building. ';
                }
            }
        }

        // Frequency analysis
        if (stats.totalWorkouts > 0) {
            const workoutFrequency = stats.totalWorkouts / Math.max(1, Math.floor((Date.now() - new Date(profile.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 7)));
            
            content += `You're averaging ${workoutFrequency.toFixed(1)} workouts per week. `;
            
            if (goal === 'build-muscle' && workoutFrequency < 3) {
                content += 'For muscle building, aim for 3-4 workouts per week. ';
            } else if (goal === 'lose-fat' && workoutFrequency < 4) {
                content += 'For fat loss, aim for 4-5 workouts per week. ';
            } else if (goal === 'improve-endurance' && workoutFrequency < 3) {
                content += 'For endurance, aim for 3-4 cardio sessions per week. ';
            }
        }

        // Streak analysis
        if (stats.workoutStreak > 0) {
            content += `Great job maintaining a ${stats.workoutStreak}-day workout streak! `;
        }

        return {
            title: 'Workout Performance',
            content: content || 'Keep up the great work with your workouts!'
        };
    }

    analyzeNutritionPerformance(stats, profile) {
        let content = '';
        const goal = profile.goal;

        // Calorie analysis
        if (stats.averageCalories > 0) {
            const recommended = window.nutritionModule.getRecommendedMacros();
            if (recommended) {
                const calorieDiff = stats.averageCalories - recommended.calories;
                if (Math.abs(calorieDiff) < 200) {
                    content += 'Your calorie intake is well-balanced. ';
                } else if (calorieDiff > 0) {
                    content += 'You\'re consuming more calories than recommended. ';
                } else {
                    content += 'You\'re consuming fewer calories than recommended. ';
                }
            }
        }

        // Protein analysis
        if (stats.averageProtein > 0) {
            const recommended = window.nutritionModule.getRecommendedMacros();
            if (recommended) {
                const proteinDiff = stats.averageProtein - recommended.protein;
                if (goal === 'build-muscle' && proteinDiff < -20) {
                    content += 'Consider increasing protein intake for muscle building. ';
                } else if (proteinDiff > 0) {
                    content += 'Good protein intake! ';
                }
            }
        }

        // Consistency
        if (stats.totalMeals > 0) {
            content += `You've logged ${stats.totalMeals} meals. `;
            if (stats.mostLoggedFood) {
                content += `Your most logged food is ${stats.mostLoggedFood}. `;
            }
        }

        return {
            title: 'Nutrition Tracking',
            content: content || 'Keep tracking your nutrition for better insights!'
        };
    }

    analyzeHydrationPerformance(stats) {
        let content = '';

        if (stats.averageDaily > 0) {
            const target = window.hydrationModule.targetHydration;
            const percentage = (stats.averageDaily / target) * 100;
            
            if (percentage >= 100) {
                content += 'Excellent hydration! You consistently meet your daily water goals. ';
            } else if (percentage >= 80) {
                content += 'Good hydration habits. You\'re close to your daily target. ';
            } else {
                content += 'Consider increasing your water intake to meet your daily hydration goals. ';
            }
        }

        if (stats.currentStreak > 0) {
            content += `Great job maintaining a ${stats.currentStreak}-day hydration streak! `;
        }

        if (stats.targetAchievement > 0) {
            content += `You meet your hydration target ${stats.targetAchievement.toFixed(1)}% of the time. `;
        }

        return {
            title: 'Hydration Status',
            content: content || 'Stay hydrated for optimal performance!'
        };
    }

    analyzeRecoveryPerformance(stats) {
        let content = '';

        if (stats.averageEnergy > 0) {
            if (stats.averageEnergy >= 7) {
                content += 'Excellent energy levels! You\'re well-rested and ready for training. ';
            } else if (stats.averageEnergy >= 5) {
                content += 'Good energy levels. Consider optimizing sleep and stress management. ';
            } else {
                content += 'Your energy levels are low. Focus on recovery, sleep, and stress management. ';
            }
        }

        if (stats.energyTrend === 'improving') {
            content += 'Your energy levels are improving - great work on recovery! ';
        } else if (stats.energyTrend === 'declining') {
            content += 'Your energy levels are declining. Consider taking a rest day or reducing intensity. ';
        }

        if (stats.painFrequency > 0) {
            if (stats.painFrequency > 30) {
                content += 'You\'re experiencing frequent pain. Consider consulting a healthcare provider. ';
            } else if (stats.mostCommonPainLocation) {
                content += `Focus on addressing pain in ${stats.mostCommonPainLocation}. `;
            }
        }

        return {
            title: 'Recovery & Energy',
            content: content || 'Monitor your recovery for optimal performance!'
        };
    }

    analyzeHabitsPerformance(stats) {
        let content = '';

        if (stats.averageCompletionRate > 0) {
            if (stats.averageCompletionRate >= 80) {
                content += 'Excellent habit consistency! You\'re building strong fitness habits. ';
            } else if (stats.averageCompletionRate >= 60) {
                content += 'Good habit consistency. Keep working on building routine. ';
            } else {
                content += 'Your habit completion rate is low. Consider simplifying your habits. ';
            }
        }

        if (stats.bestHabit) {
            content += `Your best habit is "${stats.bestHabit.name}". `;
        }

        if (stats.totalCompletions > 0) {
            content += `You've completed ${stats.totalCompletions} habit instances total. `;
        }

        return {
            title: 'Habit Consistency',
            content: content || 'Start building healthy fitness habits!'
        };
    }

    updateRecommendations() {
        const container = document.getElementById('ai-recommendations');
        if (!container) return;

        const profile = window.profileModule.getProfile();
        if (!profile) {
            container.innerHTML = '<p class="empty-state">Complete your profile to get personalized recommendations</p>';
            return;
        }

        const recommendations = this.generateRecommendations();
        
        const recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-content">${rec.content}</div>
            </div>
        `).join('');

        container.innerHTML = recommendationsHTML;
    }

    generateRecommendations() {
        const recommendations = [];
        const profile = window.profileModule.getProfile();
        const workoutStats = window.workoutModule ? window.workoutModule.getWorkoutStats() : null;
        const nutritionStats = window.nutritionModule ? window.nutritionModule.getNutritionStats() : null;
        const hydrationStats = window.hydrationModule ? window.hydrationModule.getHydrationStats() : null;
        const painFatigueStats = window.painFatigueModule ? window.painFatigueModule.getPainFatigueStats() : null;
        const habitsStats = window.habitsModule ? window.habitsModule.getHabitsStats() : null;

        // Goal-based recommendations
        const goalRecs = this.getGoalBasedRecommendations(profile);
        recommendations.push(...goalRecs);

        // Performance-based recommendations
        if (workoutStats && workoutStats.totalWorkouts > 0) {
            const workoutRecs = this.getWorkoutRecommendations(workoutStats, profile);
            recommendations.push(...workoutRecs);
        }

        if (nutritionStats && nutritionStats.totalMeals > 0) {
            const nutritionRecs = this.getNutritionRecommendations(nutritionStats, profile);
            recommendations.push(...nutritionRecs);
        }

        if (hydrationStats && hydrationStats.totalEntries > 0) {
            const hydrationRecs = this.getHydrationRecommendations(hydrationStats);
            recommendations.push(...hydrationRecs);
        }

        if (painFatigueStats && painFatigueStats.totalEntries > 0) {
            const recoveryRecs = this.getRecoveryRecommendations(painFatigueStats);
            recommendations.push(...recoveryRecs);
        }

        if (habitsStats && habitsStats.totalHabits > 0) {
            const habitsRecs = this.getHabitsRecommendations(habitsStats);
            recommendations.push(...habitsRecs);
        }

        // General recommendations
        const generalRecs = this.getGeneralRecommendations();
        recommendations.push(...generalRecs);

        return recommendations.slice(0, 5); // Limit to 5 recommendations
    }

    getGoalBasedRecommendations(profile) {
        const recommendations = [];
        const goal = profile.goal;
        const experience = profile.experience;

        switch (goal) {
            case 'build-muscle':
                recommendations.push({
                    title: 'Muscle Building Focus',
                    content: 'Focus on compound movements like squats, deadlifts, and bench press. Aim for 3-4 sets of 6-12 reps with progressive overload.'
                });
                recommendations.push({
                    title: 'Protein Intake',
                    content: 'Ensure adequate protein intake (1.6-2.2g per kg body weight) to support muscle growth and recovery.'
                });
                break;
            case 'lose-fat':
                recommendations.push({
                    title: 'Fat Loss Strategy',
                    content: 'Create a caloric deficit through diet and exercise. Include both cardio and strength training for optimal fat loss.'
                });
                recommendations.push({
                    title: 'High-Intensity Training',
                    content: 'Incorporate HIIT workouts 2-3 times per week to boost metabolism and burn more calories.'
                });
                break;
            case 'improve-endurance':
                recommendations.push({
                    title: 'Endurance Training',
                    content: 'Gradually increase cardio duration and intensity. Mix steady-state and interval training for best results.'
                });
                recommendations.push({
                    title: 'Recovery for Endurance',
                    content: 'Allow adequate recovery between cardio sessions and focus on proper nutrition for sustained energy.'
                });
                break;
        }

        return recommendations;
    }

    getWorkoutRecommendations(stats, profile) {
        const recommendations = [];

        if (stats.totalWorkouts < 3) {
            recommendations.push({
                title: 'Increase Workout Frequency',
                content: 'Aim for at least 3 workouts per week to see consistent progress toward your goals.'
            });
        }

        if (stats.averageVolume < 500 && profile.goal === 'build-muscle') {
            recommendations.push({
                title: 'Progressive Overload',
                content: 'Gradually increase your workout volume by adding weight, sets, or reps to continue building muscle.'
            });
        }

        return recommendations;
    }

    getNutritionRecommendations(stats, profile) {
        const recommendations = [];

        const recommended = window.nutritionModule.getRecommendedMacros();
        if (recommended) {
            if (stats.averageProtein < recommended.protein * 0.8) {
                recommendations.push({
                    title: 'Increase Protein Intake',
                    content: 'Add more protein-rich foods to support your fitness goals and recovery.'
                });
            }
        }

        return recommendations;
    }

    getHydrationRecommendations(stats) {
        const recommendations = [];

        if (stats.averageDaily < stats.targetHydration * 0.8) {
            recommendations.push({
                title: 'Improve Hydration',
                content: 'Set reminders to drink water throughout the day and carry a water bottle with you.'
            });
        }

        return recommendations;
    }

    getRecoveryRecommendations(stats) {
        const recommendations = [];

        if (stats.averageEnergy < 5) {
            recommendations.push({
                title: 'Prioritize Recovery',
                content: 'Focus on getting 7-9 hours of quality sleep and consider stress management techniques.'
            });
        }

        if (stats.painFrequency > 20) {
            recommendations.push({
                title: 'Address Pain',
                content: 'Consider consulting a physical therapist or healthcare provider to address recurring pain.'
            });
        }

        return recommendations;
    }

    getHabitsRecommendations(stats) {
        const recommendations = [];

        if (stats.averageCompletionRate < 60) {
            recommendations.push({
                title: 'Simplify Habits',
                content: 'Reduce the number of habits and focus on building consistency with 1-2 key habits first.'
            });
        }

        return recommendations;
    }

    getGeneralRecommendations() {
        return [
            {
                title: 'Consistency is Key',
                content: 'Focus on building sustainable habits rather than perfect workouts. Small, consistent efforts lead to big results.'
            },
            {
                title: 'Listen to Your Body',
                content: 'Pay attention to your energy levels and pain. Rest when needed and adjust your training accordingly.'
            }
        ];
    }

    // Get personalized coaching message
    getPersonalizedMessage() {
        const profile = window.profileModule.getProfile();
        if (!profile) {
            return "I'm here to help you achieve your fitness goals! Complete your profile to get personalized coaching.";
        }

        const today = this.getTodaySummary();
        let message = `Hello ${profile.name}! `;

        if (today.energyLevel !== null && today.energyLevel < 4) {
            message += "I notice your energy is low today. Consider a lighter workout or rest day. ";
        } else if (today.energyLevel !== null && today.energyLevel > 7) {
            message += "Great energy today! Perfect time for an intense workout. ";
        }

        if (today.hasPain && today.averagePainIntensity > 6) {
            message += "You're experiencing significant pain. Consider rest and consult a healthcare provider if needed. ";
        }

        return message;
    }

    getTodaySummary() {
        const today = window.fitnessApp.getToday();
        const energyEntry = window.painFatigueModule ? 
            window.painFatigueModule.painFatigueData.find(entry => 
                entry.type === 'energy' && entry.date === today
            ) : null;
        
        const painEntries = window.painFatigueModule ? 
            window.painFatigueModule.painFatigueData.filter(entry => 
                entry.type === 'pain' && entry.date === today
            ) : [];

        return {
            energyLevel: energyEntry ? energyEntry.level : null,
            painEntries: painEntries,
            hasPain: painEntries.length > 0,
            averagePainIntensity: painEntries.length > 0 
                ? painEntries.reduce((sum, entry) => sum + entry.intensity, 0) / painEntries.length 
                : 0
        };
    }
}

// Initialize AI coach module
document.addEventListener('DOMContentLoaded', () => {
    window.aiCoachModule = new AICoachModule();
});

// Export for use in other modules
window.AICoachModule = AICoachModule;
