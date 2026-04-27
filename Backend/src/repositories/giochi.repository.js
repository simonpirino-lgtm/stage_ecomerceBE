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
const create = async (data) => Giochi.create(data);

const update = async (id, data) => {
    const gioco = await Giochi.findByPk(id);
    if (!gioco) return null;
    return gioco.update(data);
};

const remove = async (id) => {
    const gioco = await Giochi.findByPk(id);
    if (!gioco) return null;
    await gioco.destroy();
    return true;
};

module.exports = {findAll, getCategoryName, getGamesByCategory, create, update, remove};