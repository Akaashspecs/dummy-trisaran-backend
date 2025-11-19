const { db } = require("../config/firebaseAdmin");

exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required in query" });
    }

    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .get();

    let notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    notifications = notifications.sort((a, b) => {
      const timeA =
        a.createdAt._seconds * 1000 + a.createdAt._nanoseconds / 1e6;
      const timeB =
        b.createdAt._seconds * 1000 + b.createdAt._nanoseconds / 1e6;
      return timeB - timeA; // latest first
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
