const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Exercise = sequelize.define('Exercise', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        workoutId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'workouts',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        muscleGroup: {
            type: DataTypes.STRING
        },
        sets: {
            type: DataTypes.INTEGER,
            defaultValue: 3
        },
        reps: {
            type: DataTypes.STRING, // e.g., "8-12", "10", "30s"
            defaultValue: "10"
        },
        weight: {
            type: DataTypes.DECIMAL(6, 2), // kg
            defaultValue: 0
        },
        duration: {
            type: DataTypes.INTEGER, // seconds
            defaultValue: 0
        },
        distance: {
            type: DataTypes.DECIMAL(8, 2), // meters
            defaultValue: 0
        },
        rest: {
            type: DataTypes.INTEGER, // seconds
            defaultValue: 60
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        notes: {
            type: DataTypes.TEXT
        },
        difficulty: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            defaultValue: 'beginner'
        },
        equipment: {
            type: DataTypes.STRING
        },
        instructions: {
            type: DataTypes.TEXT
        },
        videoUrl: {
            type: DataTypes.STRING
        },
        imageUrl: {
            type: DataTypes.STRING
        },
        caloriesBurned: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        volume: {
            type: DataTypes.DECIMAL(10, 2), // weight * reps * sets
            defaultValue: 0
        },
        rpe: {
            type: DataTypes.INTEGER, // Rate of Perceived Exertion (1-10)
            validate: {
                min: 1,
                max: 10
            }
        }
    }, {
        tableName: 'exercises',
        indexes: [
            {
                fields: ['workout_id']
            },
            {
                fields: ['muscle_group']
            },
            {
                fields: ['name']
            }
        ]
    });

    return Exercise;
};
