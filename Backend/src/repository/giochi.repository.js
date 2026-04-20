const { Giochi, Categoria } = require('../models');

const findAll = async () => 
{
    return await Giochi.findAll();
};

const getCategoryName = async() => 
{
    return await Categoria.findAll({
        attributes: ['nome']
    });
};

const getGamesByCategory = async(categoryName) =>
{
  return await Giochi.findAll({
    include: {
      model: Categoria,
      as: "categoria",
      attributes: ["nome"],
      through: { attributes: [] },
      where: {
        nome: categoryName
      }
    }
  });
};

module.exports = {findAll, getCategoryName, getGamesByCategory};