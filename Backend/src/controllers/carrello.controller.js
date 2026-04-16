const carrelloService = require('../services/carrello.service');

const getCarrello = async (req, res) => 
    {
    try {
        const utenteId =req.params.id;
        const carrello = await carrelloService.recuperaCarrelloCompleto(utenteId);
        res.status(200).json(carrello);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const aggiungi = async (req, res) => {
    try {
        const { carrelloId, giocoId, quantita} = req.body;
        //const utenteId = req.user ? req.user.id : 1;
        await carrelloService.aggiungiProdotto(carrelloId, giocoId, quantita);
        res.status(200).json({ message: "Prodotto aggiunto" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateQuantita = async (req, res) => {
    try {
        const { id, quantita } = req.body;
        await carrelloService.aggiornaQuantita(id, quantita);
        res.status(200).json({ message: "Quantità aggiornata" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const rimuovi = async (req, res) => {
    try {
        await carrelloService.eliminaProdotto(req.params.id);
        res.status(200).json({ message: "Prodotto rimosso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTotale = async (req, res) => {
    try {
        const utenteId = req.params.id;
        const { totaleArticoli, totalePrezzo } = await carrelloService.calcolaTotaleCarrello(utenteId);
        res.status(200).json({ totaleArticoli, totalePrezzo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getCarrello, aggiungi, updateQuantita, rimuovi, getTotale };
