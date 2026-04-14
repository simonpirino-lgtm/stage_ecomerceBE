const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CheckoutRighe = sequelize.define('CheckoutRighe', 
{
    id: 
    {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_checkout: 
    {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    id_gioco:
    {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    quantita: 
    {
        type: DataTypes.INTEGER(11),
        allowNull: false
    }
}, 
{
    tableName: 'checkout_righe', // Nome tabella basato sui tuoi dati
    timestamps: false            // Di solito queste tabelle di dettaglio non usano timestamps
});

module.exports = CheckoutRighe;
