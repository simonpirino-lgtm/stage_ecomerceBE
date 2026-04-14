const Utenti = require("../models/Utenti.js");


const getUtente = async () => 
{
    return await Utenti.findOne
    ({
        where: 
        {
            userid: id,
            password: password
        }
    })
};

module.exports = {getUtente};