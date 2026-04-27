const Utenti = require('../models/Utenti');

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

module.exports = { findAll, updateUtente, findAllSafe };