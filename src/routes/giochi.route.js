const express = require('express');
const router = express.Router();
const Controller = require('../controllers/giochi.controller.js');

router.get('/getall',Controller.findAll);

module.exports = router;

