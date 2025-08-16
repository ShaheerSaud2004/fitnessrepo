const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Workout = sequelize.define('Workout', {
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
        type: {
            type: DataTypes.ENUM('strength', 'cardio', 'flexibility', 'mixed'),
            defaultValue: 'strength'
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        duration: {
            type: DataTypes.INTEGER, // minutes
            defaultValue: 45
        },
        difficulty: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            defaultValue: 'beginner'
        },
        totalVolume: {
            type: DataTypes.DECIMAL(10, 2), // kg
            defaultValue: 0
        },
        totalSets: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        totalReps: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        caloriesBurned: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        notes: {
            type: DataTypes.TEXT
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        rating: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1,
                max: 5
            }
        },
        mood: {
            type: DataTypes.ENUM('great', 'good', 'okay', 'bad', 'terrible')
        },
        energyLevel: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1,
                max: 10
            }
        },
        location: {
            type: DataTypes.STRING
        },
        equipment: {
            type: DataTypes.JSON, // Array of equipment used
            defaultValue: []
        },
        tags: {
            type: DataTypes.JSON, // Array of tags
            defaultValue: []
        }
    }, {
        tableName: 'workouts',
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

    return Workout;
};
