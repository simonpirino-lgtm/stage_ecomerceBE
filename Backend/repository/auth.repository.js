const Utenti = require("../models/Utenti.js");


const getUtente = async (id, password) => {
    return await Utenti.findOne({
        where: {
            userid: id,
            password: password
        }
    })
};

module.exports = {getUtente};