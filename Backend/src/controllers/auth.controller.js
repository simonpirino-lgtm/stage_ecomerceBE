const utentiService = require('../services/utenti.service');
const authService = require('../services/auth.service')

const findAll = async (req,res) => {
    try{
        const utenti = await utentiService.findAll();
        return res.status(200).json({utenti});
    } catch(error){
        console.error(error);
        return res.status(404).json({ message: "Errore nel ritrovamento dei dati", errore: error});
    }
}

const register = async (req,res) => {
    try {
        
    } catch (error) {
        
    }
}

const login = async (req, res) => {
  try {
    const user = await authService.login(req.body);

    if (!user) {
      return res.status(401).json({ message: "Utente non trovato" });
    }

    return res.status(200).json(user);

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {findAll, login};