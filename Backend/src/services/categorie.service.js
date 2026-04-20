const giochiRepo = require('../repository/giochi.repository');

const getCategoryName = async () => {
    return await giochiRepo.getCategoryName();
};

module.exports = { getCategoryName };