const express = require('express');
const router = express.Router();
const { getNotificheUtente } = require('../controllers/notifiche.controller');
const { verifyToken } = require('../services/auth.middleware');

router.get('/', verifyToken, getNotificheUtente);

module.exports = router;