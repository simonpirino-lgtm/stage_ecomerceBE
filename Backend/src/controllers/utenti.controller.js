const utentiService = require('../services/utenti.service');
const utentiRepo = require('../repositories/utenti.repository'); // ✅ import aggiunto



const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { newUserid, newPassword } = req.body;

        const result = await utentiService.updateProfile(userId, { newUserid, newPassword });

        if (!result) {
            return res.status(400).json({ message: "Nessun dato fornito per l'aggiornamento" });
        }

        res.json({ message: "Profilo aggiornato con successo!" });

    } catch (err) {
        if (err.message === 'USERNAME_ALREADY_EXISTS') {
            return res.status(409).json({ message: "Username già in uso" });
        }

        res.status(500).json({ message: err.message });
    }
};

const getAllUtenti = async (req, res) => {
    try {
        const utenti = await utentiRepo.findAllSafe();  // 👈 nuovo metodo
        const altriUtenti = utenti.filter(u => u.id !== req.user.id);
        res.status(200).json(altriUtenti);
    } catch (error) {
        res.status(500).json({ message: 'Errore recupero utenti' });
    }
};

const getUtentiRegalabili = async (req, res) => {
  try {
    // Chiama il service che restituisce tutti gli utenti tranne te stesso
    const utenti = await utentiService.getUtentiRegalabili(
      req.user.id,
      req.params.idGioco
    );

    // Filtra chi ha già il gioco nella libreria
    const regalabili = utenti.filter(u => !u.Libreria || u.Libreria.length === 0);

    res.json(regalabili);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { updateProfile , getAllUtenti, getUtentiRegalabili};