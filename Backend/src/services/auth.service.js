const Utenti = require("../models/Utenti");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepo = require('../repository/auth.repository');
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

 
  const user = await authRepo.getUserByRefreshToken(refreshToken);
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
  // Imposta refreshToken = null nel DB per quel token
  // Anche se il cookie rimane nel browser, il token non sarà più trovato nel DB
  if (refreshToken) {
    await authRepo.deleteRefreshToken(refreshToken);
  }
};

module.exports = { login, register, getUtenteByUserid, creaUtente ,refresh,logout};