const { Sequelize } = require('sequelize');
require('dotenv').config();

//variabile per il log alle query
const logg = String(process.env.DB_LOGGING ?? 'false').toLowerCase() === 'true';


//configurazione del database
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: process.env.DB_DIALECT || "mysql",
  logging: logg,
});

module.exports = sequelize;
