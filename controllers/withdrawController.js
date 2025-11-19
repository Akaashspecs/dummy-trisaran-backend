const { db, admin } = require("../config/firebaseAdmin");

exports.createWithdrawRequest = async (req, res) => {
  try {
    const { amount, bankAccountId, bankDetails, userId, userName, userPhone } =
      req.body;

    if (!amount || !bankAccountId || !bankDetails || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRequest = {
      amount: Number(amount),
      bankAccountId,
      bankDetails: {
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        bankName: bankDetails.bankName,
        ifscCode: bankDetails.ifscCode,
      },
      userId,
      userName,
      userPhone,
      status: "pending",
      requestedAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection("withdrawalRequests").add(newRequest);

    return res.status(201).json({
      message: "Withdraw request submitted",
      id: docRef.id,
      data: newRequest,
    });
  } catch (error) {
    console.error("Withdraw API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
