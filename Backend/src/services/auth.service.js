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

const register = async ({ userid, password }) => {
  const existingUser = await getUtenteByUserid(userid);

  if (existingUser) {
    return { message: 'User already exists' };
  }

  const newUser = await creaUtente(userid, password);
  return newUser;
};

const login = async ({ userid, password }) => {
  const user = await getUtenteByUserid(userid);
  if (!user) return null; // utente non trovato

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null; // password sbagliata

  return user; // login corretto
};

const addCredit = async (userId, amount) => {
  console.log("USER ID:", userId); // DEBUG

  const user = await Utenti.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.credito = (user.credito || 0) + amount;
  await user.save();

  return user;
};

module.exports = { login, register, getUtenteByUserid, creaUtente, addCredit };