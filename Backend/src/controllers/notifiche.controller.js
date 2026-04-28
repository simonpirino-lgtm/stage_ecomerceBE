const { Notifiche } = require('../models');

const getNotificheUtente = async (req, res) => {
  try {
    const idUtente = req.user.id;  // assume che verifyToken aggiunga l'id dell'utente a req.user
    const notifiche = await Notifiche.findAll({
      where: { id_utente: idUtente },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifiche);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getNotificheUtente };