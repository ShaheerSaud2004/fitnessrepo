const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Habit = sequelize.define('Habit', {
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
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        frequency: {
            type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
            defaultValue: 'daily'
        },
        target: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        unit: {
            type: DataTypes.STRING,
            defaultValue: 'times'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        startDate: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        endDate: {
            type: DataTypes.DATEONLY
        },
        category: {
            type: DataTypes.STRING
        },
        color: {
            type: DataTypes.STRING,
            defaultValue: '#6366f1'
        },
        icon: {
            type: DataTypes.STRING
        },
        reminder: {
            type: DataTypes.TIME
        },
        streak: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        longestStreak: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        totalCompletions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'habits',
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['isActive']
            },
            {
                fields: ['category']
            }
        ]
    });

    return Habit;
};
