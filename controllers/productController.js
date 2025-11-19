const { db } = require("../config/firebaseAdmin");

// GET products by category
exports.getProducts = async (req, res) => {
  try {
    const category = req.query.category;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // Admin SDK way:
    const snapshot = await db
      .collection("products")
      .where("category", "==", category)
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
