const express = require('express');
const router = express.Router();
const { addCredit } = require('../services/auth.service');
const { verifyToken } = require('../services/auth.middleware');

router.post('/', verifyToken, async (req, res) => {
  try {
    

    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await addCredit(userId, amount);

    res.json({ credito: user.credito });

  } catch (err) {
    console.error(err); // 👈 IMPORTANTISSIMO
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;