const { db, admin } = require("../config/firebaseAdmin");

// CREATE SUPPORT TICKET
exports.createSupportTicket = async (req, res) => {
  try {
    const {
      category,
      subject,
      message,
      priority = "normal",
      userId,
      userName,
      userEmail,
      userPhone,
    } = req.body;

    if (!category || !subject || !message || !userId) {
      return res.status(400).json({
        success: false,
        message: "category, subject, message, and userId are required",
      });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const newTicket = {
      category,
      subject,
      message,
      priority,

      userId,
      userName,
      userEmail,
      userPhone,

      status: "open",
      createdAt: timestamp,
      updatedAt: timestamp,

      adminReply: null,
      adminRepliedAt: null,
      replies: [],
    };

    const docRef = await db.collection("supportTickets").add(newTicket);

    // 🔥 Fetch the document again to get actual timestamps
    const savedDoc = await docRef.get();
    const savedData = { id: savedDoc.id, ...savedDoc.data() };

    return res.json({
      success: true,
      message: "Support ticket created successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET TICKETS BY USER
exports.getSupportTicketsByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const snapshot = await db
      .collection("supportTickets")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.addReplyToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, userId, isAdmin = false, adminId } = req.body;

    if (!ticketId || !message) {
      return res.status(400).json({
        success: false,
        message: "ticketId and message are required",
      });
    }

    const ticketRef = db.collection("supportTickets").doc(ticketId);
    const ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Build reply object
    const replyObj = {
      message,
      timestamp: admin.firestore.Timestamp.now(),
      isAdmin,
    };

    // Attach ids
    if (isAdmin) replyObj.adminId = adminId;
    else replyObj.userId = userId;

    // Firestore update
    const updateData = {
      replies: admin.firestore.FieldValue.arrayUnion(replyObj),
      updatedAt: timestamp,
    };

    if (isAdmin) {
      updateData.adminReply = message;
      updateData.adminRepliedAt = timestamp;
    } else {
      updateData.hasUserReply = true;
    }

    await ticketRef.update(updateData);

    // Fetch updated ticket
    const updatedDoc = await ticketRef.get();

    return res.json({
      success: true,
      message: "Reply added successfully",
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
