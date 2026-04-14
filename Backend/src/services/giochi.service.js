const giochiRepo = require('../repository/giochi.repository');

const findAll = async () => 
{
    return await giochiRepo.findAll();
}

module.exports = {findAll};