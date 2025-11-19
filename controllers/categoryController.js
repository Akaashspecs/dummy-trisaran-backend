// controllers/categoryController.js

const { db } = require("../config/firebaseAdmin");
// GET all categories
exports.getCategories = async (req, res) => {
  try {
    const snapshot = await db.collection("categories").orderBy("order").get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
