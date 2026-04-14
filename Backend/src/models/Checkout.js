const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Checkout = sequelize.define('Checkout', 
{
    id: 
    {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    datacreazione: 
    {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Imposta automaticamente la data attuale
    }
}, 
{
    tableName: 'checkout', // Nome della tabella
    timestamps: false      // Usiamo 'datacreazione' al posto dei classici timestamps di Sequelize
});

module.exports = Checkout;
