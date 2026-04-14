const Utenti = require('../models/Utenti');

const findAll = async () => {
    return await Utenti.findAll();
}


module.exports = {findAll};