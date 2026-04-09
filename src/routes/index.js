const express = require('express');
const router = express.Router();

const utentiRoute = require('./utenti.route');
const giochiRoute = require('./giochi.route');

router.use('/utenti', utentiRoute);



x


router.use('/giochi',giochiRoute);

module.exports = router;
