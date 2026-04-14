const utentiRepository = require('../repositories/utenti.repository');


const findAll = async () => 
{
    return await utentiRepository.findAll();
}

module.exports = {findAll};