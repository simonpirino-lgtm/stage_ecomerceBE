const carrelloRepository = require('../repository/carrello.repository');

const IVA_PERCENTUALE = 0.22;

const recuperaCarrelloCompleto = async (utenteId) => {

    const items = await carrelloRepository.getCartByUtente(utenteId);

    const totaleArticoli = items.reduce((acc, item) => {
        return acc + (item.quantita || 0);
    }, 0);

    const subtotale = items.reduce((acc, item) => {
        const prezzo = parseFloat(item.gioco?.prezzo || 0);
        const qta = item.quantita || 0;
        return acc + (prezzo * qta);
    }, 0);

    const iva = subtotale * IVA_PERCENTUALE;
    const totale = subtotale + iva;

    return {
        items,
        totaleArticoli,
        subtotale,
        iva,
        totale
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

const calcolaTotaleCarrello = async (utenteId) => 
    {
    const items = await carrelloRepository.getCartByUtente(utenteId);

    /* console.log("ITEMS PER TOTALE:", items); */

    const subtotale = items.reduce((acc, item) => {
        const prezzo = parseFloat(item.gioco?.prezzo || 0);
        return acc + (prezzo * (item.quantita || 0));
    }, 0);

    const totaleArticoli = items.reduce((acc, item) => {
        /* console.log("QTA:", item.quantita); */
        return acc + (item.quantita || 0);
    }, 0);

    const totalePrezzo = items.reduce((acc, item) => {
        const prezzo = parseFloat(item.prezzo_unitario || item.gioco?.prezzo || 0);
        /* console.log("PREZZO:", prezzo, "QTA:", item.quantita); */
        return acc + (prezzo * (item.quantita || 0));
    }, 0);

    /* console.log("TOTALE ARTICOLI:", totaleArticoli);
    console.log("TOTALE PREZZO:", totalePrezzo); */

    return { 
        totaleArticoli, 
        subtotale,
        iva: subtotale * IVA_PERCENTUALE,
        totale: subtotale + (subtotale * IVA_PERCENTUALE)
    };
};
module.exports = { 
    recuperaCarrelloCompleto, 
    aggiungiProdotto, 
    aggiornaQuantita, 
    sommaQuantitaProdotti,
    eliminaProdotto ,
    calcolaTotaleCarrello,
};