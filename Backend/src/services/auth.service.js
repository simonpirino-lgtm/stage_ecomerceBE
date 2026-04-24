const Utenti = require("../models/Utenti");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepo = require('../repositories/auth.repository');
const ACCESS_TOK = process.env.JWT_SECRET || 'dev_access_secret';
const REFRESH_TOK = process.env.JWT_REFRESH || 'dev_refresh_secret';

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

   // login correttoù

  const accessToken = jwt.sign(
    {id :user.id, userid : user.userid},
    ACCESS_TOK,
    {expiresIn : '10m'}
  );

  const refreshToken =jwt.sign(
    {id: user.id ,userid :user.userid},
    REFRESH_TOK,
    {expiresIn : '7d'}
  );

  await authRepo.salvaRefreshToken(user.id ,refreshToken);
  return {
    accessToken,
    refreshToken,
    user: {
      id:      user.id,
      userid:  user.userid,
      credito: user.credito
    }
  }
};
const refresh = async (refreshToken) => {
 
  jwt.verify(refreshToken, REFRESH_TOK);

 
  const user = await authRepo.getUtenteByRefreshToken(refreshToken);
  if (!user) return null; // token non trovato nel DB → già invalidato

  // 3. Genera il nuovo access token
  const newAccessToken = jwt.sign(
    { id: user.id, userid: user.userid },
    ACCESS_TOK,
    { expiresIn: '10m' }
  );

 
  const newRefreshToken = jwt.sign(
    { id: user.id, userid: user.userid },
    REFRESH_TOK,
    { expiresIn: '7d' }
  );

  await authRepo.salvaRefreshToken(user.id, newRefreshToken);

  return { accessToken: newAccessToken, newRefreshToken };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;
  await authRepo.deleteRefreshToken(refreshToken);
};

const getMe = async (userId) => {
  const user = await Utenti.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    userid: user.userid,
    credito: Number(user.credito)
  };
};

const addCredit = async (userId, amount) => {
  const user = await Utenti.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const current = Number(user.credito);
  const add = Number(amount);

  const result = current + add;

  user.credito = Math.round(result * 100) / 100;

  await user.save();

  return {
    id: user.id,
    userid: user.userid,
    credito: Number(user.credito)
  };

};
// Aggiungi questo metodo nella classe AuthService

// Aggiungi questo metodo nella classe AuthService

module.exports = {
  login,
  register,
  getUtenteByUserid,
  creaUtente,
  addCredit,
  getMe,
  logout,
  refresh
};
