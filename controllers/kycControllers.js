const { db, admin } = require("../config/firebaseAdmin");

// Required KYC fields
const requiredKycFields = [
  "aadharImageBase64",
  "aadharNumber",
  "fullName",
  "panImageBase64",
  "panNumber",
  "phoneNumber",
  "profileImageBase64",
  "status",
  "storageMethod",
  "userId",
];

// POST – Create new KYC request
exports.createKycRequest = async (req, res) => {
  try {
    const data = req.body;

    // Check required fields
    const missingFields = requiredKycFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing_fields: missingFields,
      });
    }

    // Firestore timestamp
    const timestamp = admin.firestore.Timestamp.now();

    const kycData = {
      ...data,
      submittedAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to "kycRequest" collection
    const docRef = await db.collection("kycRequests").add(kycData);
    console.log("ddsdfsdfds");
    await db.collection("users").doc(data.userId).update({
      kycStatus: "pending",
      profileImageBase64: data.profileImageBase64,
      updatedAt: timestamp,
    });

    return res.status(201).json({
      success: true,
      message: "KYC request submitted successfully",
      kycId: docRef.id,
      data: kycData,
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
