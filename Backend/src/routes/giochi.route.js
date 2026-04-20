const express = require('express');
const router = express.Router();
const Controller = require('../controllers/giochi.controller');
const categorieController = require('../controllers/categorie.controller');
const { verifyToken } = require('../services/auth.middleware');

router.get('/getall', verifyToken, Controller.findAll);
// router.get('/getall',Controller.findAll);
router.get('/categoria/:nome', Controller.getGamesByCategory);

router.get('/categorie', categorieController.findAll);

module.exports = router;

