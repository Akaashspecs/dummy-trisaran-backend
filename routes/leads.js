// routes/leadsRoutes.js

const express = require("express");
const router = express.Router();
const { getLeads, createLead } = require("../controllers/leadsController");

// GET /api/leads
router.get("/", getLeads);
router.post("/", createLead);

module.exports = router;
