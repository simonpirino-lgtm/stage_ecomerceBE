const express = require('express');
const router = express.Router();

const { verifyToken, requireAdmin } = require('../services/auth.middleware');
const controller = require('../controllers/admin.controller');

// tutte protette
router.post('/giochi', verifyToken, requireAdmin, controller.create);
router.put('/giochi/:id', verifyToken, requireAdmin, controller.update);
router.delete('/giochi/:id', verifyToken, requireAdmin, controller.remove);

module.exports = router;