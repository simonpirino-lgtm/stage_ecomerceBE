const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Utenti = sequelize.define(
    'utenti',
    {
        id: 
        {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userid: 
        {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        password: 
        {
            type: DataTypes.STRING(500),
            allowNull: false,
        }, refreshToken: 
        {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        credito: {
            type: DataTypes.DECIMAL(10,2),
            unsigned: true,
            allowNull: false,
            defaultValue: '0.00',
        }
    },
    {
        tableName: 'utenti',
        timestamps: false,
    }

)

module.exports = Utenti;