require('dotenv').config();
const express = require('express');
const routes = require('./src/routes');


const app = express();


app.use(express.json());

app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  return res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = app;
