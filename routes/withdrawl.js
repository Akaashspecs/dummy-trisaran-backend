const express = require("express");
const router = express.Router();

const { createWithdrawRequest } = require("../controllers/withdrawController");

// POST → Create Ticket
router.post("/create", createWithdrawRequest);

module.exports = router;
