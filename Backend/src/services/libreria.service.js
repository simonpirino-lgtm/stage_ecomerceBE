const { Libreria, Giochi, Utenti } = require('../models');

/**
 * Recupera la libreria completa di un utente con i dettagli dei giochi
 * @param {number} userId - ID dell'utente
 */
const getLibreria = async (userId) => {
  try {
    // 1. Controllo preliminare: l'utente esiste?
    const utente = await Utenti.findByPk(userId);
    if (!utente) {
      throw new Error("Utente non trovato");
    }

    // 2. Recupero record libreria con JOIN sui Giochi
    const libreria = await Libreria.findAll({
      where: { id_utente: userId },
      include: [{
        model: Giochi,
        as: 'gioco',
        // Possiamo scegliere di caricare solo i campi necessari per il FE
        attributes: ['id', 'titolo', 'prezzo', 'image_url', 'descrizione'] 
      }],
      // Ordiniamo per i più recenti acquistati (opzionale)
      order: [['id', 'DESC']]
    });

    // 3. Gestione caso libreria vuota (non è un errore, ma è utile saperlo)
    if (!libreria || libreria.length === 0) {
      return [];
    }

    return libreria;
  } catch (error) {
    console.error("ERRORE SERVICE LIBRERIA:", error.message);
    throw error; // Rilanciamo l'errore per farlo gestire al controller
  }
};

/**
 * Opzionale: Verifica se un utente possiede già un gioco specifico
 * Utile per disabilitare il tasto "Compra" nella Home
 */
const possiedeGioco = async (userId, giocoId) => {
  const record = await Libreria.findOne({
    where: {
      id_utente: userId,
      id_gioco: giocoId
    }
  });
  return !!record; // Restituisce true se esiste, false altrimenti
};

module.exports = { 
  getLibreria,
  possiedeGioco
};