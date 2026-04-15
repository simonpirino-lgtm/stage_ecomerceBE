const { Carrello } = require('../models');

const findItem = async (utenteId, giocoId) => {
    return await Carrello.findOne({ where: { utente_id: utenteId, gioco_id: giocoId } });
};

const updateQuantita = async (id, quantita) => {
    return await Carrello.update({ quantita }, { where: { id } });
};

const createItem = async (dati) => {
    return await Carrello.create(dati);
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