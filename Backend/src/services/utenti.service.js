const { getUtenteByUserid, creaUtente } = require('../repository/auth.repository');
const bcrypt = require('bcrypt');

const register = async ({ userid, password }) => {
  if (!userid || !password) return null;

  const existingUser = await getUtenteByUserid(userid);
  if (existingUser) return null;

  const newUser = await creaUtente(userid, password);
  return newUser;
};

const login = async ({ userid, password }) => {
  const user = await getUtenteByUserid(userid);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
};

module.exports = { register, login };