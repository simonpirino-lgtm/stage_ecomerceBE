const express = require('express');
const router = express.Router();
const { getNotificheUtente, segnaComeLetta, segnaTutteComeLette } = require('../controllers/notifiche.controller');
const { verifyToken } = require('../services/auth.middleware');

router.get('/', verifyToken, getNotificheUtente);

router.patch('/:id', verifyToken, segnaComeLetta);
router.patch('/', verifyToken, segnaTutteComeLette);

module.exports = router;