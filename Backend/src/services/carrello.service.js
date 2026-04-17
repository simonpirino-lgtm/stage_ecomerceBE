const carrelloRepository = require('../repository/carrello.repository');

const recuperaCarrelloCompleto = async (utenteId) => 
    {
    const items = await carrelloRepository.getCartByUtente(utenteId);
    
    // LOGICA SPOSTATA: Calcolo totali lato server
    const totaleArticoli = items.reduce((acc, item) => acc + (item.quantita || 0), 0);
    const subtotale = items.reduce((acc, item) => {
        const prezzo = parseFloat(item.prezzo_unitario) || 0;
        return acc + (prezzo * item.quantita);
    }, 0);

    return {
        items,
        totaleArticoli,
        subtotale
    };
};

const aggiungiProdotto = async (utenteId, giocoId, quantita) => {
    const itemEsistente = await carrelloRepository.findItem(utenteId, giocoId);

    if (itemEsistente) {
        return await carrelloRepository.updateQuantita(
            itemEsistente.id,
            itemEsistente.quantita + quantita
        );
    }

    return await carrelloRepository.createItem(
        utenteId,
        giocoId,
        quantita
    );
};

const aggiornaQuantita = async (id, quantita) => {
    return await carrelloRepository.updateQuantita(id, quantita);
};

const eliminaProdotto = async (id) => {
    return await carrelloRepository.deleteItem(id);
};

module.exports = { 
    recuperaCarrelloCompleto, 
    aggiungiProdotto, 
    aggiornaQuantita, 
    eliminaProdotto 
};