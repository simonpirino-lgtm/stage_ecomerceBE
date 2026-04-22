const { getUtenteByUserid, creaUtente } = require('../repository/auth.repository');
const { Carrello } = require('../models');
const utentiRepository = require('../repository/utenti.repository');
const bcrypt = require('bcrypt');

const register = async ({ userid, password }) => {
  if (!userid || !password) return null;

  const existingUser = await getUtenteByUserid(userid);
  if (existingUser) return null;

  const newUser = await creaUtente(userid, password);

  await Carrello.create({
    id_utente: newUser.id
  });

  /* console.log("🛒 CARRELLO CREATO PER USER:", newUser.id); */

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
        updateData.userid = newUserid;
    }

    if (newPassword) {
        // Criptiamo la nuova password prima di salvarla
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updateData).length === 0) return null;

    return await utentiRepository.updateUtente(id, updateData);
};


module.exports = { register, login ,updateProfile};