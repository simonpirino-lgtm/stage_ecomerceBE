const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Giochi = sequelize.define(
    'Giochi',
    {
        // Name=id | DataType=3 (INT) | AUTO_INCREMENT
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        // Name=titolo | DataType=27 (VARCHAR) | LengthSet=500
        titolo: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        // Name=prezzo | DataType=10 (DECIMAL) | LengthSet=20,2
        // Usiamo DECIMAL per i soldi per evitare problemi di arrotondamento dei float
        prezzo: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: true // AllowNull=1
        },
        // Name=datarilascio | DataType=16 (DATE)
        datarilascio: {
            type: DataTypes.DATEONLY, // DATEONLY se è solo YYYY-MM-DD
            allowNull: false
        },
        // Name=sviluppatore | DataType=27 (VARCHAR) | LengthSet=500
        sviluppatore: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        // Name=image_url | DataType=30 (TEXT/LONGVARCHAR)
        image_url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // Name=descrizione | DataType=27 (VARCHAR/TEXT) | LengthSet=5000
        descrizione: {
            type: DataTypes.STRING(5000),
            allowNull: false
        }
    },
    {
        tableName: 'giochi', // Sostituisci con il nome reale della tabella se diverso
        timestamps: false
    }
);

module.exports = Giochi;