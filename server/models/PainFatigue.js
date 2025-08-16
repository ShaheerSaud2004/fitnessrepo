const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PainFatigue = sequelize.define('PainFatigue', {
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
        painLevel: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0,
                max: 10
            }
        },
        fatigueLevel: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0,
                max: 10
            }
        },
        energyLevel: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0,
                max: 10
            }
        },
        bodyAreas: {
            type: DataTypes.JSON, // Array of body areas with pain
            defaultValue: []
        },
        painType: {
            type: DataTypes.ENUM('sharp', 'dull', 'throbbing', 'aching', 'burning', 'tingling', 'numbness')
        },
        painDuration: {
            type: DataTypes.ENUM('acute', 'chronic', 'intermittent')
        },
        triggers: {
            type: DataTypes.JSON, // Array of triggers
            defaultValue: []
        },
        notes: {
            type: DataTypes.TEXT
        },
        sleepQuality: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1,
                max: 10
            }
        },
        sleepHours: {
            type: DataTypes.DECIMAL(3, 1)
        },
        stressLevel: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0,
                max: 10
            }
        },
        mood: {
            type: DataTypes.ENUM('excellent', 'good', 'okay', 'bad', 'terrible')
        }
    }, {
        tableName: 'pain_fatigue',
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['date']
            },
            {
                fields: ['user_id', 'date']
            }
        ]
    });

    return PainFatigue;
};
