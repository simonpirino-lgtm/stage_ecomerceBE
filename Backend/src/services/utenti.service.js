const { getUtenteByUserid, creaUtente } = require('../repositories/auth.repository');
const { Carrello } = require('../models');
const utentiRepository = require('../repositories/utenti.repository');
const bcrypt = require('bcrypt');

const register = async ({ userid, password }) => {
  if (!userid || !password) return null;

  const existingUser = await getUtenteByUserid(userid);
  if (existingUser) return null;

  const newUser = await creaUtente(userid, password);

  await Carrello.create({
    id_utente: newUser.id
  });

  

  return newUser;
};

const login = async ({ userid, password }) => {
  const user = await getUtenteByUserid(userid);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
};

const updateProfile = async (id, { newUserid, newPassword }) => {
    const updateData = {};

    if (newUserid) {
        const existingUser = await getUtenteByUserid(newUserid);

        // ⚠️ Se esiste ed è un altro utente → errore
        if (existingUser && existingUser.id !== id) {
            throw new Error('USERNAME_ALREADY_EXISTS');
        }

        updateData.userid = newUserid;
    }

    if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(newPassword, salt);
    }

    if (newPassword || newUserid) {
        updateData.refreshToken = null;
    }

    if (Object.keys(updateData).length === 0) return null;

    return await utentiRepository.updateUtente(id, updateData);
};

const getUtentiRegalabili = async (idMittente, idGioco) => {
  const data = await utentiRepo.getUtentiRegalabili(idMittente, idGioco);

  return data.filter(u => !u.libreria || u.libreria.length === 0);
};


module.exports = { register, login , updateProfile, getUtentiRegalabili};