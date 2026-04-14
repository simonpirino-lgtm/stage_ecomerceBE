// Importa la classe principale Sequelize dal pacchetto sequelize
const { Sequelize } = require("sequelize");


// Carica le variabili d'ambiente dal file .env nell'oggetto process.env
// Fondamentale per non esporre dati sensibili (password, host) nel codice
require("dotenv").config();

// Gestione dinamica del logging:
// Legge DB_LOGGING dal .env, lo converte in stringa, lo trasforma in minuscolo
// e verifica se è 'true'. Il risultato sarà un valore booleano (true/false).
// Se la variabile non esiste, di default è 'false'.
const logg = String(process.env.DB_LOGGING ?? 'false').toLowerCase() === 'true';

// Inizializzazione dell'istanza Sequelize
const sequelize = new Sequelize
(
  process.env.DB_NAME,     // Nome del database
  process.env.DB_USER,     // Nome utente per l'accesso
  process.env.DB_PASSWORD, // Password dell'utente
  {
    // Host del database (es. localhost o un IP remoto)
    host: process.env.DB_HOST,
    
    // Converte la porta in Numero (le variabili d'ambiente sono sempre stringhe)
    port: Number(process.env.DB_PORT),
    
    // Specifica il tipo di database (mysql, postgres, sqlite, ecc.)
    // Se non specificato nel .env, usa "mysql" come valore predefinito
    dialect: process.env.DB_DIALECT || "mysql",
    
    // Determina se mostrare le query SQL nella console (molto utile in sviluppo)
    logging: logg,
  }
);

// Esporta l'istanza per poterla utilizzare nei modelli (Models)
// e per stabilire la connessione nel file principale del server
module.exports = sequelize;