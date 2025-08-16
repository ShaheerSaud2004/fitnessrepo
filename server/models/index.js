const { Sequelize } = require('sequelize');
const path = require('path');

// Use different database files for test vs production
const isTest = process.env.NODE_ENV === 'test';
const dbPath = isTest 
    ? path.join(__dirname, 'database', 'test-fitness.db')
    : path.join(__dirname, 'database', 'fitness.db');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: isTest ? false : console.log, // Disable logging in tests
    define: {
        timestamps: true
    }
});

// Import models
const User = require('./User')(sequelize);
const Profile = require('./Profile')(sequelize);
const Workout = require('./Workout')(sequelize);
const Exercise = require('./Exercise')(sequelize);
const Nutrition = require('./Nutrition')(sequelize);
const Hydration = require('./Hydration')(sequelize);
const PainFatigue = require('./PainFatigue')(sequelize);
const Schedule = require('./Schedule')(sequelize);
const Habit = require('./Habit')(sequelize);
const Settings = require('./Settings')(sequelize);

// Define associations
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Workout, { foreignKey: 'userId', as: 'workouts' });
Workout.belongsTo(User, { foreignKey: 'userId' });

Workout.hasMany(Exercise, { foreignKey: 'workoutId', as: 'exercises' });
Exercise.belongsTo(Workout, { foreignKey: 'workoutId' });

User.hasMany(Nutrition, { foreignKey: 'userId', as: 'nutrition' });
Nutrition.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Hydration, { foreignKey: 'userId', as: 'hydration' });
Hydration.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PainFatigue, { foreignKey: 'userId', as: 'painFatigue' });
PainFatigue.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Schedule, { foreignKey: 'userId', as: 'schedule' });
Schedule.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Habit, { foreignKey: 'userId', as: 'habits' });
Habit.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Settings, { foreignKey: 'userId', as: 'settings' });
Settings.belongsTo(User, { foreignKey: 'userId' });

// Initialize database
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // For test environment, use force sync to ensure clean state
        // For production, use alter sync to preserve data
        const syncOptions = process.env.NODE_ENV === 'test' 
            ? { force: true, logging: false } 
            : { alter: true, logging: false };
            
        // Drop all tables first in test environment to avoid index conflicts
        if (process.env.NODE_ENV === 'test') {
            try {
                await sequelize.drop();
                console.log('✅ Existing tables dropped for clean test environment');
            } catch (error) {
                // Ignore errors if tables don't exist
            }
        }
        
        await sequelize.sync(syncOptions);
        console.log('✅ Database models synchronized.');
        
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
};

module.exports = {
    sequelize,
    User,
    Profile,
    Workout,
    Exercise,
    Nutrition,
    Hydration,
    PainFatigue,
    Schedule,
    Habit,
    Settings,
    initializeDatabase
};
