const utentiService = require('../services/utenti.service');

const updateProfile = async (req, res) => {
    try {
        // req.user.id viene dal tuo verifyToken middleware
        const userId = req.user.id; 
        const { newUserid, newPassword } = req.body;

        const result = await utentiService.updateProfile(userId, { newUserid, newPassword });

        if (!result) {
            return res.status(400).json({ message: "Nessun dato fornito per l'aggiornamento" });
        }

        res.json({ message: "Profilo aggiornato con successo!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { updateProfile };