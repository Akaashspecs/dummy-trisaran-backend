// utils/agentCode.js
const { db } = require("../config/firebaseAdmin");

async function generateAgentCode() {
  const ref = db.collection("counters").doc("agentCode");
  const currentYear = new Date().getFullYear().toString();

  const newCode = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    let lastNumber = 0;
    let year = currentYear;
    if (doc.exists) {
      const data = doc.data();
      if (String(data.year) === currentYear) {
        lastNumber = data.lastNumber || 0;
      } else {
        lastNumber = 0;
      }
    }

    const nextNumber = lastNumber + 1;
    tx.set(
      ref,
      {
        year: currentYear,
        lastNumber: nextNumber,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    const padded = String(nextNumber).padStart(3, "0"); // 001, 002
    return `TM${currentYear}${padded}`;
  });

  return newCode;
}

module.exports = { generateAgentCode };
