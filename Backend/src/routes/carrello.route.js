const express = require('express');
const router = express.Router();
const carrelloController = require('../controllers/carrello.controller');

router.get('/get/:id', carrelloController.getCarrello);
router.post('/aggiungi', carrelloController.aggiungi);
router.put('/update-qty', carrelloController.updateQuantita);
router.delete('/:id', carrelloController.rimuovi);
router.get('/totale/:id', carrelloController.getTotale);

module.exports = router;