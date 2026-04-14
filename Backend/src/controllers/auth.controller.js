const utentiService = require('../services/utenti.service');

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

const login = async (req,res) => {
    try {
        const utenti = await utentiService.login(req.body);
        return res.status(200).json({utenti});
    } catch (error) {
        return res.status(401).json({ message: "Utente o password non corretti", errore: error});
    }
}

module.exports = {findAll, login};