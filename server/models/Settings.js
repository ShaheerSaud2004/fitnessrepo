const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Settings = sequelize.define('Settings', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        theme: {
            type: DataTypes.ENUM('light', 'dark', 'auto'),
            defaultValue: 'light'
        },
        units: {
            type: DataTypes.ENUM('metric', 'imperial'),
            defaultValue: 'metric'
        },
        notifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        emailNotifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        pushNotifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        workoutReminders: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        hydrationReminders: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        nutritionReminders: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        habitReminders: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        reminderTime: {
            type: DataTypes.TIME,
            defaultValue: '09:00:00'
        },
        language: {
            type: DataTypes.STRING,
            defaultValue: 'en'
        },
        timezone: {
            type: DataTypes.STRING,
            defaultValue: 'UTC'
        },
        privacyLevel: {
            type: DataTypes.ENUM('public', 'friends', 'private'),
            defaultValue: 'private'
        },
        dataSharing: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        autoBackup: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        backupFrequency: {
            type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
            defaultValue: 'weekly'
        },
        customGoals: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        displayPreferences: {
            type: DataTypes.JSON,
            defaultValue: {
                showCalories: true,
                showMacros: true,
                showProgress: true,
                showCharts: true
            }
        }
    }, {
        tableName: 'settings',
        indexes: [
            {
                unique: true,
                fields: ['userId'],
                name: 'settings_userId_unique'
            }
        ]
    });

    return Settings;
};
