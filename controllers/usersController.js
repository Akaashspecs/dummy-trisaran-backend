// controllers/usersController.js
const { db, auth } = require("../config/firebaseAdmin");

async function getMyProfile(req, res) {
  try {
    const uid = req.user.uid;
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists)
      return res.status(404).json({ error: "Profile not found" });
    return res.json({ uid, ...doc.data() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
}

async function updateProfile(req, res) {
  try {
    const uid = req.user.uid;
    const updates = req.body;
    updates.updatedAt = new Date();
    await db.collection("users").doc(uid).set(updates, { merge: true });

    // if email changed, mirror to Firebase Auth
    if (updates.email) {
      await auth.updateUser(uid, { email: updates.email });
    }

    return res.json({ msg: "Profile updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}

module.exports = { getMyProfile, updateProfile };
