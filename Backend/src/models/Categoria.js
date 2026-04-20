const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const Categoria = sequelize.define(
    'Categoria',
    {
        // Name=id | DataType=3 (INT) | LengthSet=11 | DefaultText=AUTO_INCREMENT
        id: 
        {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unsigned: false // Unsigned=0
        },
        // Name=id_utente | DataType=3 (INT) | LengthSet=11 | AllowNull=0
        Nome: 
        {
            type: DataTypes.STRING,
            allowNull: false,
            unsigned: false // Unsigned=0
        }
    },
    {
        tableName: 'categoria',
        timestamps: false,
    }
);
module.exports = Categoria;