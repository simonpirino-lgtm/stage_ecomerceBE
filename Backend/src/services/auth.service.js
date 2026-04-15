const Utenti = require("../models/Utenti");

const getUtenteByUserid = async (userid) => {
  return await Utenti.findOne({ where: { userid } });
};

const creaUtente = async (userid, password) => {
  return await Utenti.create({ userid, password });
};

const register = async ({ userid, password }) => {
  const existingUser = await getUtenteByUserid(userid);

  if (existingUser) {
    return { message: 'User already exists' };
  }

  const newUser = await creaUtente(userid, password);

  return newUser;
};

const login = async ({ userid, password }) => {
  const user = await Utenti.findOne({
    where: { userid, password }
  });

  if (!user) {
    return { message: 'User not found' };
  }

  return user;
};

module.exports = { login, register, getUtenteByUserid, creaUtente };