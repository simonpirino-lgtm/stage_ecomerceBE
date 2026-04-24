const libreriaRepository = require('../repository/libreria.repository');
const getMiaLibreria = async (req, res) => {
  try {
    // req.user.id viene popolato dal middleware verifyToken
    const utenteId = req.user.id; 

    // Usiamo il metodo della repository che mi hai inviato
    const giochi = await libreriaRepository.findAllByUserId(utenteId);

    res.status(200).json(giochi);
  } catch (error) {
    console.error("ERRORE CONTROLLER LIBRERIA:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMiaLibreria };