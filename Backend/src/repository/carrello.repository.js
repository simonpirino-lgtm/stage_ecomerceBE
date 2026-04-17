const { Carrello, OrdiniCarrello, Giochi } = require('../models');

const findItem = async (utenteId, giocoId) => {
    return await OrdiniCarrello.findOne({
        where: { id_utente: utenteId, id_gioco: giocoId }
    });
};

const updateQuantita = async (id, quantita) => {
    return await OrdiniCarrello.update({ quantita }, { where: { id } });
};

const createItem = async (utenteId, giocoId, quantita) => {
    return await OrdiniCarrello.create({
        id_utente: utenteId,
        id_gioco: giocoId,
        quantita
    });
};

const getCartByUtente = async (utenteId) => {
    return await OrdiniCarrello.findAll({
        where: { id_utente: utenteId },
        include: [{
            model: Giochi,
            as: 'gioco'
        }]
    });
};

const deleteItem = async (id) => {
    return await OrdiniCarrello.destroy({ where: { id } });
};

module.exports = { findItem, updateQuantita, createItem, getCartByUtente, deleteItem };