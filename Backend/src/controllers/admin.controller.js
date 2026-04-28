const { Giochi } = require('../models');

exports.create = async (req, res) => {
  try {
    const gioco = await Giochi.create(req.body);
    res.json(gioco);
  } catch (err) {
    res.status(500).json({ error: 'Errore creazione' });
  }
};

exports.update = async (req, res) => {
  try {
    await Giochi.update(req.body, {
      where: { id: req.params.id }
    });
    res.json({ message: 'Aggiornato' });
  } catch (err) {
    res.status(500).json({ error: 'Errore update' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Giochi.destroy({
      where: { id: req.params.id }
    });
    res.json({ message: 'Eliminato' });
  } catch (err) {
    res.status(500).json({ error: 'Errore delete' });
  }
};