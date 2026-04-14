const express = require("express");
const { route } = require("./utenti.route");
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/user", authController.user);


module.exports = route;