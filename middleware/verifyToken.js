// middleware/verifyToken.js
const { admin } = require("../config/firebaseAdmin");

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/Bearer (.*)/);
  if (!match) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const idToken = match[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // uid, email, etc.
    next();
  } catch (err) {
    console.error("verifyToken error", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
