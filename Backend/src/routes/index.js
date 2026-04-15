const express = require('express');
const router = express.Router();

const utentiRoute = require('./utenti.route');
const giochiRoute = require('./giochi.route');
const authRoute = require('./auth.route');
const carrelloRoute = require('./carrello.route');

router.use('/utenti', utentiRoute);

router.use('/auth', authRoute);

router.use('/giochi',giochiRoute);

router.use('/carrello', carrelloRoute);

module.exports = router;