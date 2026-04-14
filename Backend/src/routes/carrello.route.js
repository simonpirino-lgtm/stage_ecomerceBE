const express = require('express');
const router = express.Router();
const carrelloController = require('../controllers/carrello.controller');

router.get('/test', (req, res) => res.send('OK'));

module.exports = router;