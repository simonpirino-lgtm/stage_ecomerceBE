const { Libreria, Giochi } = require('../models');

const getUserLibrary = async (userId) => {
  return await Libreria.findAll({
    where: { id_utente: userId },
    include: [{ model: Giochi, as: 'gioco' }]
  });
};

module.exports = { getUserLibrary };