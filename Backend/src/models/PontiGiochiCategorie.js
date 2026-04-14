const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PonteGiochiCategorie = sequelize.define('PonteGiochiCategorie', 
{
    id_gioco: 
    {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        allowNull: false
    },
    id_categoria: 
    {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        allowNull: false
    }
}, 
{
    tableName: 'pontegiochicategorie',
    timestamps: false
});

module.exports = PonteGiochiCategorie;
