const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const keyPath = path.join(
  process.cwd(),
  "ssm-db",
  "serviceAccountKey-SSM.json"
);

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function cleanIC(icNumber) {
  return String(icNumber || "").replace(/-/g, "");
}

async function cleanSSMICNumbers() {
  try {
    const snapshot = await db.collection("ssm_business_person").get();

    if (snapshot.empty) {
      console.log("No records found in ssm_business_person.");
      return;
    }

    const batch = db.batch();
    let updateCount = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      if (!data.ic_number) {
        return;
      }

      const cleanedIC = cleanIC(data.ic_number);

      if (cleanedIC !== data.ic_number) {
        batch.update(doc.ref, {
          ic_number: cleanedIC,
        });

        updateCount++;
      }
    });

    if (updateCount === 0) {
      console.log("No IC numbers needed cleaning.");
      return;
    }

    await batch.commit();

    console.log(`Cleaned ${updateCount} IC numbers.`);
  } catch (error) {
    console.error("Failed to clean SSM IC numbers:", error);
  }
}

cleanSSMICNumbers();