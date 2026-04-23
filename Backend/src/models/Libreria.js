const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Libreria = sequelize.define('Libreria', {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_utente: {
    type: DataTypes.INTEGER(11),
    allowNull: false
  },
  id_gioco: {
    type: DataTypes.INTEGER(11),
    allowNull: false
  },
  quantita: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'libreria',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_utente', 'id_gioco']
    }
  ]
});

module.exports = Libreria;