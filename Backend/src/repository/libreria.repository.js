const { Libreria, Giochi } = require('../models');

const findAllByUserId = async (userId) => {
    return await Libreria.findAll({
        where: { id_utente: userId },
        include: [{ model: Giochi, as: 'gioco' }]
    });
};

module.exports = { findAllByUserId };