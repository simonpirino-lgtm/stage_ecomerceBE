const { Carrello, OrdiniCarrello } = require('../models');

const findItem = async (carrelloId, giocoId) => {
    console.log(carrelloId + " " + giocoId);
    return await OrdiniCarrello.findOne({ where: { id_carrello: carrelloId, id_gioco: giocoId } });
};

const updateQuantita = async (id, quantita) => {
    return await Carrello.update({ quantita }, { where: { id } });
};

const createItem = async (carrelloId, giocoId, quantita) => {
    console.log(carrelloId + " " + giocoId);
    return await OrdiniCarrello.create({
        id_carrello: carrelloId,
        id_gioco: giocoId,
        quantita: quantita
    });
};

const getCartByUtente = async (utenteId) => {
    return await Carrello.findAll({
        where: {id_utente: utenteId },
        include: ['giochi'] // Assicurati che l'associazione 'Gioco' sia definita nei modelli
    });
};

const deleteItem = async (id) => {
    return await Carrello.destroy({ where: { id } });
};

module.exports = { findItem, updateQuantita, createItem, getCartByUtente, deleteItem };