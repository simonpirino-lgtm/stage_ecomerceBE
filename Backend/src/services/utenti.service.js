const Utenti = require("../models/Utenti");

// Trova un utente per userid
const getUtenteByUserid = async (userid) => {
  return await Utenti.findOne({ where: { userid } });
};

// Crea un nuovo utente
const creaUtente = async (userid, password) => {
  return await Utenti.create({ userid, password });
};

// REGISTER
const register = async ({ userid, password }) => {
  const existingUser = await getUtenteByUserid(userid); // ✅ ora dentro async function

  if (existingUser) {
    // Utente già esistente
    return null; // meglio null che {message: ...}
  }

  const newUser = await creaUtente(userid, password);
  return newUser;
};

// LOGIN
const login = async ({ userid, password }) => {
  const user = await Utenti.findOne({
    where: { userid, password }
  });

  if (!user) {
    return null; // meglio null che {message: ...}
  }

  return user;
};

// Trova tutti gli utenti
const findAll = async () => {
  return await Utenti.findAll();
};

module.exports = { getUtenteByUserid, creaUtente, register, login, findAll };