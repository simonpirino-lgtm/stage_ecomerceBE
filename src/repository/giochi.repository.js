const Giochi = require('../models/Giochi.js');

const findAll = async () => {
    return await Giochi.findAll();
};

module.exports = {findAll};