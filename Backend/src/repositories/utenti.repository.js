const Utenti = require('../models/Utenti');
const Libreria = require('../models/Libreria');
const { Op } = require('sequelize');

const findAll = async () => {
    return await Utenti.findAll();
};
const findAllSafe = async () => {
    return await Utenti.findAll({
        attributes: { exclude: ['password', 'refreshToken'] }   // 👈 esclude i campi sensibili
    });
};
// NUOVA FUNZIONE: Aggiorna i dati nel DB
const updateUtente = async (id, data) => {
    return await Utenti.update(data, { where: { id: id } });
};

const getUtentiRegalabili = async (idMittente, idGioco) => {
  return await Utenti.findAll({
    where: {
      id: { [Op.ne]: idMittente } // non includere se stesso
    },
    include: [{
      model: Libreria,
      as: 'libreria',
      where: { id_gioco: idGioco },
      required: false
    }]
  });
};

module.exports = { findAll, updateUtente, findAllSafe, getUtentiRegalabili };