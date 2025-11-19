// routes/categoryRoutes.js

const express = require("express");
const router = express.Router();
const { getProducts } = require("../controllers/productController");

// GET /api/categories
router.get("/", getProducts);

module.exports = router;
