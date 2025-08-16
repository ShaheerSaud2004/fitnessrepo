const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Profile = sequelize.define('Profile', {
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
        age: {
            type: DataTypes.INTEGER,
            validate: {
                min: 13,
                max: 120
            }
        },
        weight: {
            type: DataTypes.DECIMAL(5, 2), // kg
            validate: {
                min: 20,
                max: 500
            }
        },
        height: {
            type: DataTypes.DECIMAL(5, 2), // cm
            validate: {
                min: 100,
                max: 250
            }
        },
        bmi: {
            type: DataTypes.DECIMAL(4, 2)
        },
        fitnessGoals: {
            type: DataTypes.JSON, // Array of goals
            defaultValue: []
        },
        experienceLevel: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            defaultValue: 'beginner'
        },
        medicalHistory: {
            type: DataTypes.TEXT
        },
        activityLevel: {
            type: DataTypes.ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
            defaultValue: 'moderately_active'
        },
        targetWeight: {
            type: DataTypes.DECIMAL(5, 2)
        },
        targetCalories: {
            type: DataTypes.INTEGER
        },
        targetProtein: {
            type: DataTypes.INTEGER
        },
        targetCarbs: {
            type: DataTypes.INTEGER
        },
        targetFat: {
            type: DataTypes.INTEGER
        },
        preferredWorkoutTypes: {
            type: DataTypes.JSON, // Array of workout types
            defaultValue: []
        },
        injuries: {
            type: DataTypes.JSON, // Array of injuries
            defaultValue: []
        },
        medications: {
            type: DataTypes.TEXT
        },
        emergencyContact: {
            type: DataTypes.JSON
        }
    }, {
        tableName: 'profiles',
        indexes: [
            {
                unique: true,
                fields: ['user_id']
            }
        ]
    });

    return Profile;
};
