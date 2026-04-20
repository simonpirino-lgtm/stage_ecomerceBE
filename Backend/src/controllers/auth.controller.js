const utentiService = require('../services/utenti.service');
const authService = require('../services/auth.service');


const COOKIE_OPTIONS = 
{
  httpOnly: true,
  // httpOnly: true impedisce a qualsiasi script JS di leggere il cookie.
  // Anche se un attaccante inietta codice JS nella pagina (XSS),
  // non può leggere il refreshToken con document.cookie
  secure:   false,
  // secure: false permette il cookie su HTTP (sviluppo locale).
  // In produzione impostare true: il cookie verrà inviato solo su HTTPS
  sameSite: 'lax',
  // sameSite: 'lax' → protezione base contro CSRF.
  // Il cookie viene inviato nelle navigazioni GET cross-site ma non
  // nelle richieste POST cross-site non solicitate
  maxAge: 7 * 24 * 60 * 60 * 1000
  // maxAge in millisecondi: 7 giorni
  // Quando scade, il browser elimina automaticamente il cookie
};
const findAll = async (req,res) => {
  try {
    const utenti = await utentiService.findAll();
    return res.status(200).json({ utenti });
  } catch(error) {
    console.error(error);
    return res.status(500).json({ message: "Errore nel ritrovamento dei dati", errore: error.message });
  }
};

const register = async (req, res) => {
  try {
    const nuovoUtente = await utentiService.register(req.body);

    if (!nuovoUtente) {
      if (!req.body.userid || !req.body.password) {
        return res.status(400).json({ message: "User e password obbligatori" });
      }
      return res.status(409).json({ message: "User already exists" });
    }

    return res.status(201).json({
      message: "Utente registrato con successo",
      utente: nuovoUtente
    });
  } catch (error) {
    console.error("Errore register controller:", error);
    return res.status(500).json({
      message: "Errore durante la registrazione",
      errore: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const user = await authService.login(req.body);

    if (!user) 
    {
      return res.status(401).json({ message: "Utente o password errati" });
    }

    res.cookie('refreshToken', user.refreshToken, COOKIE_OPTIONS);

    return res.status(200).json(user);
 
  } catch (err) {
    console.error("Errore login controller:", err);
    return res.status(500).json({ message: "Server error", errore: err.message });
  }
};

const refresh = async (req, res) => {
  // Legge il refreshToken dal cookie (reso disponibile da cookie-parser)
  const refreshToken = req.cookies.refreshToken;

  // Se il cookie non esiste (mai loggato, cookie scaduto, o già fatto logout)
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token mancante' });
  }

  try {
    // Delega al service: verifica JWT + cerca nel DB + genera nuovi token
    const result = await authService.refresh(refreshToken);

    if (!result) {
      // null significa: token non trovato nel DB (già invalidato)
      return res.status(401).json({ message: 'Refresh token non valido' });
    }

    // Aggiorna il cookie con il NUOVO refreshToken (token rotation)
    // Il vecchio refreshToken è già stato invalidato nel DB dal service
    res.cookie('refreshToken', result.newRefreshToken, COOKIE_OPTIONS);

    // Risponde al frontend con il nuovo accessToken
    return res.status(200).json({ accessToken: result.accessToken });

  } catch (err) {
    // jwt.verify ha lanciato: token scaduto o firma invalida
    // Puliamo anche il cookie in questo caso
    res.clearCookie('refreshToken');
    return res.status(401).json({ message: 'Token non valido o scaduto' });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Invalida il token nel DB (anche se il cookie non c'è, non è un errore)
    await authService.logout(refreshToken);

    // Cancella il cookie dal browser
    // clearCookie imposta il cookie con maxAge=0, forzandone l'eliminazione
    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'Logout effettuato' });
  } catch (err) {
    return res.status(500).json({ message: 'Errore durante il logout', errore: err.message });
  }
};

module.exports = { findAll, login, register, refresh, logout };