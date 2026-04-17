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

const getCartItemsByUtente = async (utenteId) => {
    return await OrdiniCarrello.findAll({
        include: [
            {
                model: Carrello,
                required: true,
                where: { id_utente: utenteId },
                attributes: []
            },
            {
                model: Giochi,
                as: 'gioco'
            }
        ]
    });
};

const getCartByUtente = async (utenteId) => {
    return await Carrello.findAll({
        where: { id_utente: utenteId },
        include: ['giochi'] // Assicurati che l'associazione 'Gioco' sia definita nei modelli
    });
};

const deleteItem = async (id) => {
    return await OrdiniCarrello.destroy({ where: { id } });
};

module.exports = { 
    findItem, 
    updateQuantita, 
    createItem, 
    getCartByUtente, 
    getCartItemsByUtente, 
    deleteItem };