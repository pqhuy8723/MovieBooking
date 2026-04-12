const express = require("express");
const router = express.Router();
const vnpayController = require("./vnpay.controller");

router.post("/create", vnpayController.createPayment);
router.get("/ipn", vnpayController.ipn);
router.get("/return", vnpayController.return);

module.exports = router;
