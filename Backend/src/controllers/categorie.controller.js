const categorieService = require('../services/categorie.service');

const findAll = async (req, res) => {
  try {
    const categorie = await categorieService.getCategoryName();
    return res.status(200).json({ categorie });
  } catch (error) {
    return res.status(500).json({
      message: "Errore nel recupero delle categorie",
      errore: error
    });
  }
};

module.exports = { findAll };