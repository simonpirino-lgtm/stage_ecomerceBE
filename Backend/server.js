// server.js
require('dotenv').config();
const app = require('./app');
const sequelize = require('./src/config/db');
 cors = require('cors');
const carrelloRoute = require('./src/routes/index');

app.use(cors());

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    //await sequelize.sync();// ignorato: le migrazioni CLI gestiscono lo schema. sync() in produzione rischia di alterare tabelle esistenti.

    console.log('Connessione al database ecommerce API riuscita');

    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Errore connessione database:', error);
    process.exit(1);
  }
};

start();