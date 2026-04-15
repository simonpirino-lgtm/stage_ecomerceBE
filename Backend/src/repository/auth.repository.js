const Utenti = require("../models/Utenti.js");


const getUtente = async (id, password) => {
    return await Utenti.findOne({
        where: {
            userid: id,
            password: password
        }
    })
};

const creaUtente = async (id, password) => {
    return await Utenti.create({ userid: id, password });
};

module.exports = {getUtente, creaUtente};