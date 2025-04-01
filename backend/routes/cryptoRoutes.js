const express = require('express');
const { getCryptoPrices } = require('../controllers/cryptoController');

const router = express.Router();

router.get('/prices', getCryptoPrices);

module.exports = router;
