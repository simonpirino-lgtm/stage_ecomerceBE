const express = require('express');
const router = express.Router();
const libreriaController = require('../controllers/libreria.controller');
const { verifyToken } = require('../services/auth.middleware');

// Quando il frontend chiama GET /api/libreria, passa dal controllo token e restituisce i giochi
router.get('/', verifyToken, libreriaController.getMiaLibreria);
router.post('/regala', verifyToken, libreriaController.inviaRegalo);

module.exports = router;