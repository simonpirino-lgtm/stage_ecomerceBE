const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Magazzino = sequelize.define('Magazzino', {
    id: 
    {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
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
    tableName: 'magazzino', // Specifica il nome esatto della tabella
    timestamps: false       // Disabilita se non hai colonne createdAt/updatedAt
});

module.exports = Magazzino;
