const utentiService = require('../services/utenti.service');
const authService = require('../services/auth.service');

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

    if (!user) {
      return res.status(401).json({ message: "Utente o password errati" });
    }

    return res.status(200).json(user);

  } catch (err) {
    console.error("Errore login controller:", err);
    return res.status(500).json({ message: "Server error", errore: err.message });
  }
};

module.exports = { findAll, login, register };