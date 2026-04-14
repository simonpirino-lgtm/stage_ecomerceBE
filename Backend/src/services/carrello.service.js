// Importa il repository (che creeremo al punto 2)
const carrelloRepository = require('../repository/carrello.repository');

const aggiungiProdotto = async (utenteId, giocoId, prezzo) => 
{
    // 1. Controlla se il gioco è già nel carrello per questo utente
    const itemEsistente = await carrelloRepository.findItem(utenteId, giocoId);

    if (itemEsistente) 
    {
        // 2. Se esiste, incrementa la quantità
        const nuovaQuantita = itemEsistente.quantita + 1;
        return await carrelloRepository.updateQuantita(itemEsistente.id, nuovaQuantita);
    } 
    else 
    {
        // 3. Se non esiste, crea una nuova riga nel carrello
        return await carrelloRepository.createItem
        ({
            utente_id: utenteId,
            gioco_id: giocoId,
            quantita: 1,
            prezzo_unitario: prezzo 
        });
    }
};

const getTotaleCarrello = async (utenteId) => 
{
    const items = await carrelloRepository.getCartByUtente(utenteId);
    // Logica del reduce che avevi in Angular, ma fatta sul server
    return items.reduce((tot, item) => tot + (item.prezzo_unitario * item.quantita), 0);
};

module.exports = { aggiungiProdotto, getTotaleCarrello };
