const checkoutService = require('../services/checkout.service'); // Controlla che il percorso sia giusto!

const checkout = async (req, res) => {
  try {
   console.log("UTENTE CHE TENTA IL CHECKOUT:", req.user); // <--- AGGIUNGI QUESTO
    const utenteId = req.user.id;
    const result = await checkoutService.checkout(utenteId);

    res.status(200).json(result);
  } catch (error) {
    console.error("ERRORE CHECKOUT:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { checkout };