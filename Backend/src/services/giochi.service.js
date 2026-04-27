const giochiRepo = require('../repositories/giochi.repository');

const create = async (data) => giochiRepo.create(data);
const update = async (id, data) => giochiRepo.update(id, data);
const remove = async (id) => giochiRepo.remove(id);
const findAll = async () => 
{
    return await giochiRepo.findAll();
};

const getGamesByCategory = async (nome) => {
    return await giochiRepo.getGamesByCategory(nome);
};


module.exports = {
    findAll,
    getGamesByCategory,
    create,
    update,
    remove
};