const express = require("express");
const router = express.Router();
const { getCryptoPrices } = require("../controllers/cryptoController");

router.get("/prices", getCryptoPrices);

module.exports = router;
