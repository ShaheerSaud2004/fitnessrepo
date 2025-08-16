const { Sequelize } = require('sequelize');
const path = require('path');

// Create Sequelize instance with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === 'test' 
        ? path.join(__dirname, '../database/test.db')
        : path.join(__dirname, '../database/fitness.db'),
    logging: false, // Disable logging in production
    define: {
        timestamps: true, // Adds createdAt and updatedAt
        underscored: true, // Use snake_case for column names
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
        
        // Force sync all models with database (drops and recreates tables)
        await sequelize.sync({ force: true });
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
