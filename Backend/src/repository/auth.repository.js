const Utenti = require("../models/Utenti");
const bcrypt = require('bcrypt');

const getUtenteByUserid = async (userid) => {
  return await Utenti.findOne({ where: { userid } });
};

const creaUtente = async (userid, password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return await Utenti.create({ userid, password: hashedPassword });
};

const findAll = async () => {
  return await Utenti.findAll();
};

const salvaRefreshToken = async (id, refreshToken) => {
  return await Utenti.update({ refreshToken }, { where: { id } });
};

const getUtenteByRefreshToken = async (refreshToken) => {
  return await Utenti.findOne({ where: { refreshToken } });
};

const deleteRefreshToken = async (refreshToken) => {
  return await Utenti.update({ refreshToken: null }, { where: { refreshToken } });
}

module.exports = { getUtenteByUserid, creaUtente, findAll, salvaRefreshToken, getUtenteByRefreshToken, deleteRefreshToken }; 