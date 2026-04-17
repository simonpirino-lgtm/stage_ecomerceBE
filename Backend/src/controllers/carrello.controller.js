const carrelloService = require('../services/carrello.service');

const getCarrello = async (req, res) => {
    try {
        const utenteId = req.params.id;

        const carrello = await carrelloService.recuperaCarrelloCompleto(utenteId);

        console.log("CARRELLO RESULT:", JSON.stringify(carrello, null, 2));

        res.status(200).json(carrello);

    } catch (error) {
        console.error("❌ ERRORE GET CARRELLO:", error); // 🔥 QUESTO È FONDAMENTALE

        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

const aggiungi = async (req, res) => {
    try {
        const { utenteId, giocoId, quantita } = req.body;

        await carrelloService.aggiungiProdotto(utenteId, giocoId, quantita);

        res.status(200).json({ message: "Prodotto aggiunto" });
    } catch (error) {
        console.error(error); // 🔥 IMPORTANTISSIMO
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
