const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Hydration = sequelize.define('Hydration', {
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
        amount: {
            type: DataTypes.DECIMAL(6, 2), // ml
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING,
            defaultValue: 'ml'
        },
        type: {
            type: DataTypes.ENUM('water', 'coffee', 'tea', 'juice', 'sports_drink', 'other'),
            defaultValue: 'water'
        },
        time: {
            type: DataTypes.TIME,
            defaultValue: DataTypes.NOW
        },
        notes: {
            type: DataTypes.TEXT
        },
        temperature: {
            type: DataTypes.ENUM('cold', 'room_temp', 'warm', 'hot')
        },
        source: {
            type: DataTypes.ENUM('tap', 'bottled', 'filtered', 'spring', 'other')
        },
        container: {
            type: DataTypes.STRING
        },
        isTracked: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        goal: {
            type: DataTypes.DECIMAL(6, 2), // ml
            defaultValue: 2000
        },
        cumulativeAmount: {
            type: DataTypes.DECIMAL(8, 2), // Total for the day
            defaultValue: 0
        },
        percentageOfGoal: {
            type: DataTypes.DECIMAL(5, 2), // Percentage
            defaultValue: 0
        }
    }, {
        tableName: 'hydration',
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['userId', 'date']
            }
        ]
    });

    return Hydration;
};
