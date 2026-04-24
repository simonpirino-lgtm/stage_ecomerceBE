const libreriaRepository = require('../repositories/libreria.repository');
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

const getUtentiPerRegalo = async (req, res) => {
    try {
        const tutti = await utentiRepository.findAll();
        // Escludiamo noi stessi dalla lista
        const altri = tutti.filter(u => u.id !== req.user.id);
        res.status(200).json(altri);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const inviaRegalo = async (req, res) => {
    try {
        const idMittente = req.user.id;
        const { idDestinatario, idGioco } = req.body;

        const risultato = await libreriaRepository.regalaGiocoRepo(idMittente, idDestinatario, idGioco);
        res.status(200).json({ message: "Regalo inviato con successo!", risultato });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
module.exports = { getMiaLibreria, getUtentiPerRegalo, inviaRegalo };