const express = require('express');
const router = express.Router();

const utentiRoute = require('./utenti.route');


router.use('/utenti', utentiRoute);


module.exports = router;