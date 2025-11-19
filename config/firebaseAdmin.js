// config/firebaseAdmin.js
const admin = require("firebase-admin");
const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
  process.env;

console.log(process.env);
if (!admin.apps.length) {
  if (!FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PROJECT_ID) {
    throw new Error(
      "Missing Firebase admin credentials in environment variables."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      // private_key must contain actual newlines
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    projectId: FIREBASE_PROJECT_ID,
  });
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, auth, db };
