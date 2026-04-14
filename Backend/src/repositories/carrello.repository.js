const Carrello = require('../models/carrello.model');

const findByUserId = async (userId) => {
    return await Carrello.findOne({ userId });
};

const update = async (userId, datiCarrello) => {
    return await Carrello.findOneAndUpdate(
        { userId }, 
        datiCarrello, 
        { new: true, upsert: true }
    );
};

const clear = async (userId) => {
    return await Carrello.deleteOne({ userId });
};

module.exports = {
    findByUserId,
    update,
    clear
};
