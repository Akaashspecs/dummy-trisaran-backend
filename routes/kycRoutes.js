const express = require("express");
const router = express.Router();
const kycControllers = require("../controllers/kycControllers");

router.post("/create", kycControllers.createKycRequest);

module.exports = router;
