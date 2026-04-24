const giochiRepo = require('../repositories/giochi.repository');

const getCategoryName = async () => {
    return await giochiRepo.getCategoryName();
};

module.exports = { getCategoryName };