const express = require('express');
const router = express.Router();
const carrelloController = require('../controllers/carrello.controller');
const { verifyToken } = require('../services/auth.middleware');

router.get('/get/:id', verifyToken, carrelloController.getCarrello);
router.post('/aggiungi', verifyToken, carrelloController.aggiungi);
router.put('/update-qty', verifyToken, carrelloController.updateQuantita);
router.delete('/:id', verifyToken, carrelloController.rimuovi);
router.get('/totale/:id', verifyToken, carrelloController.getTotale);

module.exports = router;