const express = require("express");
const { route } = require("./utenti.route");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/user", authMiddleware, authController.user);


module.exports = route;