const express = require("express");
const router = express.Router();

const {
  createSupportTicket,
  getSupportTicketsByUser,
  addReplyToTicket,
} = require("../controllers/supportTicketController");

// POST → Create Ticket
router.post("/create", createSupportTicket);
router.get("/", getSupportTicketsByUser);
router.post("/reply/:ticketId", addReplyToTicket);

module.exports = router;
