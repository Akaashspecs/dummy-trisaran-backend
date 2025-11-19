// routes/users.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getMyProfile,
  updateProfile,
} = require("../controllers/usersController");

router.get("/me", verifyToken, getMyProfile);
router.patch("/me", verifyToken, updateProfile);

module.exports = router;
