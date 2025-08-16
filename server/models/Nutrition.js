const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Nutrition = sequelize.define('Nutrition', {
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
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        meal: {
            type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'),
            allowNull: false
        },
        foodName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        calories: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        protein: {
            type: DataTypes.DECIMAL(6, 2), // grams
            defaultValue: 0
        },
        carbs: {
            type: DataTypes.DECIMAL(6, 2), // grams
            defaultValue: 0
        },
        fat: {
            type: DataTypes.DECIMAL(6, 2), // grams
            defaultValue: 0
        },
        fiber: {
            type: DataTypes.DECIMAL(6, 2), // grams
            defaultValue: 0
        },
        sugar: {
            type: DataTypes.DECIMAL(6, 2), // grams
            defaultValue: 0
        },
        sodium: {
            type: DataTypes.DECIMAL(8, 2), // mg
            defaultValue: 0
        },
        servingSize: {
            type: DataTypes.STRING
        },
        quantity: {
            type: DataTypes.DECIMAL(6, 2),
            defaultValue: 1
        },
        unit: {
            type: DataTypes.STRING,
            defaultValue: 'serving'
        },
        notes: {
            type: DataTypes.TEXT
        },
        isTracked: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        source: {
            type: DataTypes.ENUM('manual', 'barcode', 'voice', 'ai'),
            defaultValue: 'manual'
        },
        barcode: {
            type: DataTypes.STRING
        },
        brand: {
            type: DataTypes.STRING
        },
        category: {
            type: DataTypes.STRING
        },
        allergens: {
            type: DataTypes.JSON, // Array of allergens
            defaultValue: []
        },
        ingredients: {
            type: DataTypes.TEXT
        },
        nutritionFacts: {
            type: DataTypes.JSON // Complete nutrition facts
        }
    }, {
        tableName: 'nutrition',
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['date']
            },
            {
                fields: ['meal']
            },
            {
                fields: ['user_id', 'date']
            },
            {
                fields: ['food_name']
            }
        ]
    });

    return Nutrition;
};
