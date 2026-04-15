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

module.exports = { getUtenteByUserid, creaUtente, findAll };