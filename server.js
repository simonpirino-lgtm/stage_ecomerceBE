// server.js
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./src/models');


const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    //await sequelize.sync();// ignorato: le migrazioni CLI gestiscono lo schema. sync() in produzione rischia di alterare tabelle esistenti.

    console.log('Connessione al database riuscita');

    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`,`\nDocumentazione su http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Errore connessione database:', error);
    process.exit(1);
  }
};

start();