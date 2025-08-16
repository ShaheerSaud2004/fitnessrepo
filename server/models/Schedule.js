const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Schedule = sequelize.define('Schedule', {
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
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('workout', 'cardio', 'stretching', 'rehab', 'appointment', 'other'),
            defaultValue: 'workout'
        },
        duration: {
            type: DataTypes.INTEGER, // minutes
            defaultValue: 60
        },
        notes: {
            type: DataTypes.TEXT
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        location: {
            type: DataTypes.STRING
        },
        reminder: {
            type: DataTypes.INTEGER, // minutes before event
            defaultValue: 15
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            defaultValue: 'medium'
        },
        recurrence: {
            type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly'),
            defaultValue: 'none'
        },
        recurrenceEnd: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'schedule',
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['date']
            },
            {
                fields: ['type']
            },
            {
                fields: ['user_id', 'date']
            }
        ]
    });

    return Schedule;
};
