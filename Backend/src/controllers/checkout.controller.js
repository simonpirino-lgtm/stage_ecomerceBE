const checkoutService = require('../services/checkout.service');

const checkout = async (req, res) => {
  try {
    const utenteId = req.user.id; // 🔥 PERFETTO nel tuo caso

    const result = await checkoutService.checkout(utenteId);

    res.status(200).json(result);
  } catch (error) {
    console.error("ERRORE CHECKOUT:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { checkout };