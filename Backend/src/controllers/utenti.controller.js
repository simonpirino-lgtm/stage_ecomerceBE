const utentiService = require('../services/utenti.service');


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

module.exports = { updateProfile };