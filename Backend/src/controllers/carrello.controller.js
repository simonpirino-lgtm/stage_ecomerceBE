const carrelloService = require('../services/carrello.service');

// Aggiunge un prodotto
const aggiungi = async (req, res) => {
    try {
        const { giocoId, prezzo } = req.body;
        // Se hai il middleware usa req.user.id, altrimenti metti un ID fisso per i test
        const utenteId = req.user ? req.user.id : 1; 

        const risultato = await carrelloService.aggiungiProdotto(utenteId, giocoId, prezzo);
        res.status(200).json(risultato);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Recupera il carrello (Necessario per la route router.get('/'))
const getCarrello = async (req, res) => {
    try {
        const utenteId = req.user ? req.user.id : 1;
        const carrello = await carrelloService.recuperaCarrello(utenteId);
        res.status(200).json(carrello);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Aggiorna quantità (Necessario per router.put('/update-qty'))
const updateQuantita = async (req, res) => {
    try {
        const { id, quantita } = req.body;
        await carrelloService.aggiornaQuantita(id, quantita);
        res.status(200).json({ message: "Quantità aggiornata" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Rimuovi (Necessario per router.delete('/:id'))
const rimuovi = async (req, res) => {
    try {
        await carrelloService.eliminaProdotto(req.params.id);
        res.status(200).json({ message: "Prodotto rimosso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Totale (Necessario per router.get('/totale'))
const getTotale = async (req, res) => {
    try {
        const utenteId = req.user ? req.user.id : 1;
        const totale = await carrelloService.getTotaleCarrello(utenteId);
        res.status(200).json({ totale });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Esporta TUTTE le funzioni usate nella route
module.exports = { 
    aggiungi, 
    getCarrello, 
    updateQuantita, 
    rimuovi, 
    getTotale 
};
