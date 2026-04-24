const { Libreria, Giochi } = require('../models');

const getMiaLibreria = async (req, res) => {
  try {
    const utenteId = req.user.id; // Preso dal middleware verifyToken

    // Cerchiamo tutti i record nella libreria dell'utente e "includiamo" i dati del gioco
    const laMiaLibreria = await Libreria.findAll({
      where: { id_utente: utenteId },
      include: [{
        model: Giochi,
        as: 'gioco' // ATTENZIONE: Assicurati che l'alias corrisponda a quello in models/index.js
      }]
    });

    res.status(200).json(laMiaLibreria);
  } catch (error) {
    console.error("ERRORE RECUPERO LIBRERIA:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMiaLibreria };