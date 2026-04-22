const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require('../services/auth.middleware');
const { getMe } = require('../services/auth.service');

router.get('/getAll', verifyToken, authController.findAll);

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await getMe(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/update-me', verifyToken, utentiController.updateProfile);

// Le tue rotte esistenti...
router.get('/getAll', verifyToken, utentiController.findAll);

module.exports = router;