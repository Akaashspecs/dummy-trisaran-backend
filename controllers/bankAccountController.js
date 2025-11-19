const { db, admin } = require("../config/firebaseAdmin");

// Required Fields
const requiredFields = [
  "userId",
  "accountHolderName",
  "accountNumber",
  "ifscCode",
  "bankName",
  "createdAt",
];

// POST – Add Bank Account
exports.addBankAccount = async (req, res) => {
  try {
    const data = req.body;

    // Check: Missing Required Fields
    const missing = requiredFields.filter((f) => !data[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing_fields: missing,
      });
    }

    const timestamp = admin.firestore.Timestamp.now();

    // Check if user already has a bank account
    const existingAccounts = await db
      .collection("bankAccounts")
      .where("userId", "==", data.userId)
      .get();

    const isPrimary = existingAccounts.empty; // true if no accounts exist

    // Prepare data
    const bankData = {
      ...data,
      isPrimary,
      createdAt: timestamp,
    };

    // Save to Firestore
    const docRef = await db.collection("bankAccounts").add(bankData);

    return res.status(201).json({
      success: true,
      message: "Bank account added successfully",
      bankAccountId: docRef.id,
      data: bankData,
    });
  } catch (error) {
    console.error("Error adding bank account:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getBankAccounts = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const snapshot = await db
      .collection("bankAccounts")
      .where("userId", "==", userId)
      .get();

    const accounts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteBankAccount = async (req, res) => {
  try {
    const accountId = req.params.id;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "Account ID is required",
      });
    }

    const docRef = db.collection("bankAccounts").doc(accountId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    const deletedData = doc.data();
    await docRef.delete();

    // If deleted account was primary → assign a new primary
    if (deletedData.isPrimary) {
      const userId = deletedData.userId;

      const snapshot = await db
        .collection("bankAccounts")
        .where("userId", "==", userId)
        .get();

      if (!snapshot.empty) {
        // Set first account as primary
        const firstDoc = snapshot.docs[0];
        await db.collection("bankAccounts").doc(firstDoc.id).update({
          isPrimary: true,
        });
      }
    }

    return res.json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
