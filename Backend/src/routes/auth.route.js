const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
//router.post("/user", authMiddleware, authController.user);
router.post('/refresh', authController.refresh);
// Route pubblica: permettiamo logout anche con access token scaduto
// Il refreshToken nel cookie è sufficiente per identificare la sessione
router.post('/logout', authController.logout);

module.exports = router;