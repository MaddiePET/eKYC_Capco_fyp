import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";

import crypto from "crypto";

function generateHashID(identifier) {
  return crypto.createHash('sha256').update(identifier).digest('hex');
}

let jimApp;
let jimDb;

function initializeJIM() {
  if (!jimDb) {
    const appName = "jim-api-app";

    // Reuse existing Firebase app if already initialized
    const existingApp = admin.apps.find((app) => app?.name === appName);

    if (existingApp) {
      jimApp = existingApp;
    } else {
      const serviceAccountPath = path.join(
        process.cwd(),
        "jim-db",
        "serviceAccountKey-JIM.json"
      );

      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf8")
      );

      jimApp = admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
        },
        appName
      );
    }

    jimDb = jimApp.firestore();
  }

  return jimDb;
}

const JIM_NONRESIDENTS_COLLECTION = "jim_nonresidents";

function getTitleFromSex(sex) {
  const normalizedSex = sex?.toLowerCase();

  if (normalizedSex === "male" || normalizedSex === "m") {
    return "Mr.";
  }

  if (normalizedSex === "female" || normalizedSex === "f") {
    return "Ms.";
  }

  return "";
}

function formatJIMFormData(data) {
  return {
    id_type: "passport",
    id_number: data.passport_no,
    title: getTitleFromSex(data.sex),
    full_name: data.full_name,
    date_of_birth: data.date_of_birth,
    sex: data.sex,
    passport_no: data.passport_no,
    nationality: data.nationality,
    country: data.country || data.nationality,
    issue_date: data.issue_date || "",
    exp_date: data.exp_date || "",
    issue_office: data.issue_office || "",
    visa_type: data.visa_type || "",
  };
}

async function lookupJIMIdentity(idNum) {
  const db = initializeJIM();

  if (!idNum) return null;

  // Hash the incoming idNum to match the database IDs
  const hashedID = generateHashID(idNum);

  const docRef = db.collection(JIM_NONRESIDENTS_COLLECTION).doc(hashedID);
  const docSnapshot = await docRef.get();

  let data = null;

  if (docSnapshot.exists) {
    data = docSnapshot.data();
  } else {
    const querySnapshot = await db
      .collection(JIM_NONRESIDENTS_COLLECTION)
      .where("passport_no", "==", idNum)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    data = querySnapshot.docs[0].data();
  }

  return {
    source: "jim",
    identity: data,
    formData: formatJIMFormData(data),
  };
}

export { lookupJIMIdentity };