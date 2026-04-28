const { Notifiche } = require('../models');

const createNotifica = async (id_utente, messaggio) => {
  return await Notifiche.create({
    id_utente,
    messaggio,
    letto: false
  });
};

module.exports = { createNotifica };