const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrdiniCarrello = sequelize.define('OrdiniCarrello', 
{
    id: 
    {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_carrello: 
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
    tableName: 'ordini_carrello', // Nome esatto della tabella
    timestamps: false            // Di solito non servono per le righe del carrello
});

module.exports = OrdiniCarrello;
