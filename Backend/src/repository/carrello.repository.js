const { Carrello } = require('../models'); // Assumendo che usi Sequelize o simile

const findItem = async (utenteId, giocoId) => 
{
    return await Carrello.findOne({ where: { utente_id: utenteId, gioco_id: giocoId } });
};

const updateQuantita = async (id, quantita) => 
{
    return await Carrello.update({ quantita }, { where: { id } });
};

const createItem = async (dati) => 
{
    return await Carrello.create(dati);
};

// Nel repository o service del BACK-END
// Esempio se usi Sequelize:
const getCartByUtente = async (utenteId) =>
{
    return await Carrello.findAll({
        where: { utente_id: utenteId },
        include: ['Gioco'] // <--- IMPORTANTE: include i dettagli del gioco (titolo, immagine)
    });
};


module.exports = { findItem, updateQuantita, createItem, getCartByUtente };
