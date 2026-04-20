const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require('../services/auth.middleware');

router.get('/getAll', verifyToken, authController.findAll);


module.exports = router;