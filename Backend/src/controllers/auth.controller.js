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

module.exports = {findAll};