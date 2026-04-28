const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notifiche = sequelize.define('Notifiche', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_utente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  messaggio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  letto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifiche',
  timestamps: true
});

module.exports = Notifiche;