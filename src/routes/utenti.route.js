const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.get('/getAll',authController.findAll);


module.exports = router;