const {DataTypes} = require('sequelize');
const sequelize = require('../confing/db');

const Carrello = sequelize.define(
    'Carrello',
    {
        // Name=id | DataType=3 (INT) | LengthSet=11 | DefaultText=AUTO_INCREMENT
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unsigned: false // Unsigned=0
        },
        // Name=id_utente | DataType=3 (INT) | LengthSet=11 | AllowNull=0
        id_utente: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unsigned: false // Unsigned=0
        }
    },
    {
        tableName: 'carrello',
        timestamps: false,
    }
);
module.exports = Carrello;