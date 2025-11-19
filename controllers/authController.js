// controllers/authController.js
const fetch = require("node-fetch");
const { auth, db } = require("../config/firebaseAdmin");
const { generateAgentCode } = require("../utils/agentCode");

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

if (!FIREBASE_API_KEY) {
  console.warn(
    "FIREBASE_API_KEY is not set. Login (password sign-in) will fail unless provided."
  );
}

async function signup(req, res) {
  try {
    const { name, email, password, phone, referredBy } = req.body;
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone.startsWith("+") ? phone : `+91${phone}`,
    });

    // Generate agent code
    const agentCode = await generateAgentCode();

    // Save user profile in Firestore (users collection - doc id = uid)
    const profile = {
      name,
      email,
      phone,
      agentCode,
      referredBy: referredBy || null,
      totalEarnings: 0,
      withdrawnAmount: 0,
      kycStatus: "not_submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").doc(userRecord.uid).set(profile);

    // Optionally create a custom token if you want to log user in immediately
    const customToken = await auth.createCustomToken(userRecord.uid);

    return res.status(201).json({
      msg: "User created",
      uid: userRecord.uid,
      profile,
      agentCode,
      customToken,
    });
  } catch (err) {
    console.error("signup error", err);
    let message = "Signup failed";
    if (err.code === "auth/email-already-exists")
      message = "Email already exists";
    return res.status(500).json({ error: message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    // Firebase Rest Login URL
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    // 1️⃣ Login user using REST API
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      const errMsg = data?.error?.message || "Login failed";
      return res.status(401).json({ error: errMsg });
    }

    const idToken = data.idToken;
    const uid = data.localId;

    // 2️⃣ Get full Firebase Auth user details
    const userInfoResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    const userInfoData = await userInfoResp.json();
    const authUser = userInfoData?.users?.[0] || null;

    // 3️⃣ Get Firestore user profile
    const doc = await db.collection("users").doc(uid).get();
    const profile = doc.exists ? doc.data() : null;

    // 4️⃣ Send everything
    return res.json({
      msg: "Logged in",
      idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      uid,
      authUser, // Firebase Auth user info
      profile, // Firestore user profile
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "Login error" });
  }
}

module.exports = { signup, login };
