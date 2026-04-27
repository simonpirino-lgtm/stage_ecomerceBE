const express = require('express');
const router = express.Router();

const utentiRoute = require('./utenti.route');
const giochiRoute = require('./giochi.route');
const authRoute = require('./auth.route');
const creditRoute =require('./credit.route')
const carrelloRoute = require('./carrello.route');
const categorieRoutes = require('./categorie.route');
const checkoutRoutes = require('./checkout.route');
const libreriaRoute = require('./libreria.routes')
const adminRoute = require('./admin.route');

//router.use('/admin', adminRoute);

router.use('/utenti', utentiRoute);

router.use('/auth', authRoute);

router.use('/giochi',giochiRoute);

router.use('/credito', creditRoute);

router.use('/carrello', carrelloRoute);

router.use('/checkout', checkoutRoutes);

router.use('/categorie', categorieRoutes);

router.use('/libreria', libreriaRoute);


module.exports = router;