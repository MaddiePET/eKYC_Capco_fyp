import * as admin from 'firebase-admin';
import fs from 'fs';
import path from "path";
import crypto from 'crypto';

function generateHashID(identifier) {
  return crypto.createHash('sha256').update(identifier).digest('hex');
}

let jpnApp;
let jpnDb;

function initializeJPN() {
  if (!jpnApp) {
    const appName = "jpn-api-app";

    const existingApp = admin.apps.find((app) => app?.name === appName);

    if (existingApp) {
      jpnApp = existingApp;
    } else {
      const serviceAccountPath =
        path.join(process.cwd(), "jpn-db", "serviceAccountKey-JPN.json");

      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf8")
      );

      jpnApp = admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
        },
        appName
      );
    }

    jpnDb = jpnApp.firestore();
  }

  return jpnDb;
}

const JPN_CITIZENS_COLLECTION = "jpn_citizens";

function getTitleFromSex(sex) {
  const normalizedSex = sex?.toLowerCase();

  if (normalizedSex === "lelaki" || normalizedSex === "male" || normalizedSex === "m") {
    return "Mr.";
  }

  if (normalizedSex === "perempuan" || normalizedSex === "female" || normalizedSex === "f") {
    return "Ms.";
  }

  return "";
}

function formatJPNFormData(data) {
  return {
    id_type: "mykad",
    id_number: data.ic_number,
    title: getTitleFromSex(data.sex),
    full_name: data.full_name,
    date_of_birth: data.date_of_birth,
    phone_number: data.phone_registered,
    address_line_1: data.add1,
    address_line_2: data.add2,
    postcode: data.postcode,
    state: data.state,
    country: "Malaysia",
    ic_photo: data.ic_photo ?? null,
    photo_pattern: data.photo_pattern ?? null,
  };
}

async function lookupJPNIdentity(idNum) {
  const db = initializeJPN();

  if (!idNum) return null;

  const normalizedId = idNum.replace(/-/g, "").trim();

  const hashedID = generateHashID(normalizedId);

  const docRef = db.collection(JPN_CITIZENS_COLLECTION).doc(hashedID);
  const docSnapshot = await docRef.get();

  let data = null;

  if (docSnapshot.exists) {
    data = docSnapshot.data();
  } else {
    const querySnapshot = await db
      .collection(JPN_CITIZENS_COLLECTION)
      .where("ic_number", "==", normalizedId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    data = querySnapshot.docs[0].data();
  }

  return {
    source: "jpn",
    identity: data,
    formData: formatJPNFormData(data),
  };
}

export { lookupJPNIdentity };