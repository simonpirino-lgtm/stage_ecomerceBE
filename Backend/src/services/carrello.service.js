const carrelloRepository = require('../repository/carrello.repository');

const recuperaCarrelloCompleto = async (utenteId) => {
    const carrelli = await carrelloRepository.getCartByUtente(utenteId);
    
    // Flat gli items e calcola i totali
    let items = [];
    let totaleArticoli = 0;
    let subtotale = 0;
    
    carrelli.forEach(carrello => {
        if (carrello.giochi && carrello.giochi.length > 0) {
            carrello.giochi.forEach(gioco => {
                items.push(gioco);
                const quantita = gioco.OrdiniCarrello?.quantita || 0;
                const prezzo = parseFloat(gioco.prezzo) || 0;
                
                totaleArticoli += quantita;
                subtotale += (prezzo * quantita);
            });
        }
    });

    return {
        items: carrelli, // Mantieni la struttura originale Carrello -> giochi
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

const sommaQuantitaProdotti = async (utenteId) => {
    const items = await carrelloRepository.getCartByUtente(utenteId);
    return items.reduce((acc, item) => acc + (item.quantita || 0), 0);
};

const eliminaProdotto = async (id) => {
    return await carrelloRepository.deleteItem(id);
};
const calcolaTotaleCarrello = async (utenteId) => {
    const items = await carrelloRepository.getCartItemsByUtente(utenteId);

    const totaleArticoli = items.reduce((acc, item) => acc + (item.quantita || 0), 0);
    const totalePrezzo = items.reduce((acc, item) => {
        const prezzo = parseFloat(item.gioco?.prezzo) || 0;
        return acc + (prezzo * item.quantita);
    }, 0);

    return {
        totaleArticoli,
        totalePrezzo
    };
}
module.exports = { 
    recuperaCarrelloCompleto, 
    aggiungiProdotto, 
    aggiornaQuantita, 
    sommaQuantitaProdotti,
    eliminaProdotto ,
    calcolaTotaleCarrello
};