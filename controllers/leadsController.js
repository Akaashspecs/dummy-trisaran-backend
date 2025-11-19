const { db, admin } = require("../config/firebaseAdmin");

const requiredFields = [
  "customerEmail",
  "customerName",
  "customerPhone",
  "email",
  "fullName",
  "panCard",
  "phone",
  "pincode",
  "productCategory",
  "productId",
  "productName",
  "source",
  "status",
  "userId",
];

// GET products by userId
exports.getLeads = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id is required",
      });
    }

    // Admin SDK way:
    const userLeadsSnap = await db
      .collection("leads")
      .where("userId", "==", userId)
      .get();

    const refLeadsSnap = await db
      .collection("leads")
      .where("referrerId", "==", userId)
      .get();

    let leads = [
      ...userLeadsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      ...refLeadsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ];

    return res.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.createLead = async (req, res) => {
  try {
    const data = req.body;

    // Validate Required Fields
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing_fields: missingFields,
      });
    }

    // Firestore Timestamp
    const timestamp = admin.firestore.Timestamp.now();

    const leadData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save Lead
    const docRef = await db.collection("leads").add(leadData);

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      leadId: docRef.id,
      data: leadData,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
