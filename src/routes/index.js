const express = require('express');
const router = express.Router();
const giochiRoute = require('../routes/giochi.route');


router.use('/giochi',giochiRoute);

module.exports = router;
