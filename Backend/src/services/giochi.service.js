const giochiRepo = require('../repositories/giochi.repository');

const findAll = async () => {
    return await giochiRepo.findAll();
};

const getGamesByCategory = async (nome) => {
    return await giochiRepo.getGamesByCategory(nome);
};


module.exports = {
    findAll,
    getGamesByCategory
};