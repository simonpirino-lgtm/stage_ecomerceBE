const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Checkout = sequelize.define('Checkout', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_utente: {                        // ✅ NUOVO
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    totale: {                           // ✅ NUOVO
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    iva: {                              // ✅ NUOVO
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.22
    },
    datacreazione: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, { tableName: 'checkout', timestamps: false });

module.exports = Checkout;
