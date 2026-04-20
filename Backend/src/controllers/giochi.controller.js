const giochiServizio = require('../services/giochi.service');

const findAll =  async (req,res) =>
{
try 
{
    const giochi = await giochiServizio.findAll();
    return res.status(200).json({giochi});
} 
catch (error) 
{
    console.error(error)
    return res.status(404).json({message: "errore nl ritrovamento dei dati", errore : error})
}
}

const getGamesByCategory = async (req, res) => {
  try {
    const { nome } = req.params;

    if (!nome) {
      return res.status(400).json({
        message: "Nome categoria mancante"
      });
    }

    const giochi = await giochiServizio.getGamesByCategory(nome);

    return res.status(200).json({ giochi });
  } catch (error) {
    console.error(error);
    console.log(res);
    return res.status(500).json({
      message: "Errore nel recupero dei giochi per categoria",
      errore: error
    });
  }
};

module.exports = { findAll, getGamesByCategory };