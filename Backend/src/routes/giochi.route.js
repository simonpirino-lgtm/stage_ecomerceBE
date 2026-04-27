const express = require('express');
const router = express.Router();
const Controller = require('../controllers/giochi.controller');
const categorieController = require('../controllers/categorie.controller');
const { verifyToken } = require('../services/auth.middleware');

router.get('/getall', verifyToken, Controller.findAll);
// router.get('/getall',Controller.findAll);
router.get('/categoria/:nome', Controller.getGamesByCategory);

router.get('/categorie', categorieController.findAll);


// CRUD admin (NUOVI)
router.post('/',         verifyToken, requireAdmin, Controller.create);
router.patch('/:id',     verifyToken, requireAdmin, Controller.update);
router.delete('/:id',    verifyToken, requireAdmin, Controller.remove);

module.exports = router;

