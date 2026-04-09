// app.js - File di configurazione principale dell'applicazione Express

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes'); // Importa il router centralizzato

const app = express();

// --- Middleware di Configurazione ---

// Permette ad Express di leggere i dati inviati in formato JSON nel corpo della richiesta (req.body)
app.use(express.json());

// Permette di leggere e gestire i cookie inviati dal client (req.cookies)
app.use(cookieParser());

// Configurazione Cross-Origin Resource Sharing (CORS)
// Necessaria per permettere al frontend (es. Angular) di comunicare con il backend
app.use(cors
({
    // Specifica l'indirizzo del frontend autorizzato
    origin: 'http://localhost:4200', 
    // Abilita l'invio di cookie e header di autorizzazione nelle richieste cross-site
    credentials: true,
    // Metodi HTTP consentiti
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    // Header personalizzati accettati
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Definizione delle Rotte ---

// Collega tutte le rotte definite nel modulo 'routes' al prefisso '/api'
// Esempio: se in routes esiste la rotta '/users', l'URL finale sarà '/api/users'
app.use('/api', routes);

// Rotta di test (Health Check) per verificare che il server sia attivo
app.get('/hello', (req, res) => 
{
    res.send("Server in ascolto");
});

// --- Gestione degli Errori ---

// Middleware globale per la gestione degli errori
// Viene invocato automaticamente quando viene passato un errore tramite next(err)
app.use((err, req, res, next) => 
   {
    // Logga lo stack trace dell'errore nella console del server (per il debug)
    console.error(err.stack);

    // Risponde al client con uno stato 500 (Errore interno del server)
    // Evita di esporre troppi dettagli tecnici in produzione per sicurezza
    res.status(500).json({ 
        errore: err.message || "Si è verificato un errore interno al server" 
    });
});

// Esporta l'istanza dell'app per essere utilizzata dal file di avvio (es. index.js o server.js)
module.exports = app;