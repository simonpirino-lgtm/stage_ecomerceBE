const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller');
const { verifyToken } = require('../services/auth.middleware');

router.post('/', verifyToken, checkoutController.checkout);

module.exports = router;