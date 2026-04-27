const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CheckoutRighe = sequelize.define('CheckoutRighe',
    {
    id:           
    { type: DataTypes.INTEGER(11), 
        primaryKey: true, 
        autoIncrement: true },
    id_checkout:  
    { type: DataTypes.INTEGER(11), 
        allowNull: false },
    id_gioco:     
    { type: DataTypes.INTEGER(11), 
        allowNull: false },
    quantita:     
    { type: DataTypes.INTEGER(11),
         allowNull: false },
    prezzo_unitario: 
    {                              // ✅ NUOVO: snapshot del prezzo
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, 
{ 
    tableName: 'checkout_righe', 
    timestamps: false 
});


module.exports = CheckoutRighe;
