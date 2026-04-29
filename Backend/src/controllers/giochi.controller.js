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
    
    return res.status(500).json({
      message: "Errore nel recupero dei giochi per categoria",
      errore: error
    });
  }
};
const create = async (req, res) => {
    try {
        const { titolo, prezzo, datarilascio, sviluppatore, image_url, descrizione, game_url } = req.body;

        // Validazione minima
        if (!titolo || prezzo === undefined || prezzo < 0) {
            return res.status(400).json({ message: 'Titolo e prezzo (>=0) sono obbligatori' });
        }

        const nuovo = await giochiServizio.create({ titolo, prezzo, datarilascio, sviluppatore, image_url, descrizione, game_url });
        return res.status(201).json({ gioco: nuovo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Errore creazione gioco' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const aggiornato = await giochiServizio.update(id, req.body);
        if (!aggiornato) return res.status(404).json({ message: 'Gioco non trovato' });
        return res.status(200).json({ gioco: aggiornato });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Errore aggiornamento gioco' });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminato = await giochiServizio.remove(id);
        if (!eliminato) return res.status(404).json({ message: 'Gioco non trovato' });
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Errore eliminazione gioco' });
    }
};

module.exports = { findAll, getGamesByCategory, create, update, remove };