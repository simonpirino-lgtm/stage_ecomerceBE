const giochiRepo = require('../repositories/giochi.repository');

const findAll = async () => 
{
    return await giochiRepo.findAll();
}

module.exports = {findAll};