const express = require("express");
const router = express.Router();
const {
  getNotificationsByUser,
} = require("../controllers/notificationController");

router.get("/", getNotificationsByUser);

module.exports = router;
