const { db } = require("../config/firebaseAdmin");

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.query.userId;

    console.log(userId);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Fetch user data
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    const txSnap = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .get();

    if (!userSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userSnap.data();

    const transactions = txSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      data: {
        user: {
          totalEarnings: userData.totalEarnings || 0,
          withdrawnAmount: userData.withdrawnAmount || 0,
        },
        transactions,
      },
    });
  } catch (error) {
    console.error("Error fetching earnings:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
