import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { decrypt, hashLookup } from "../lib/cryptoSecurity";

let jimApp: admin.app.App | undefined;
let jimDb: FirebaseFirestore.Firestore | undefined;

function initializeJIM() {
  if (!jimDb) {
    const appName = "jim-api-app";

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

function getTitleFromSex(sex?: string) {
  const normalizedSex = sex?.toLowerCase();

  if (normalizedSex === "male" || normalizedSex === "m") {
    return "Mr.";
  }

  if (normalizedSex === "female" || normalizedSex === "f") {
    return "Ms.";
  }

  return "";
}

function decryptJIMData(data: any) {
  return {
    passport_no: decrypt(data.passport_no, "jim"),
    full_name: decrypt(data.full_name, "jim"),
    date_of_birth: decrypt(data.date_of_birth, "jim"),
    sex: decrypt(data.sex, "jim"),
    exp_date: decrypt(data.exp_date, "jim"),
    nationality: decrypt(data.nationality, "jim"),
    country: decrypt(data.country, "jim"),
    issue_date: decrypt(data.issue_date, "jim"),
    issue_office: decrypt(data.issue_office, "jim"),
    passport_photo: decrypt(data.passport_photo, "jim"),
    visa_type: decrypt(data.visa_type, "jim"),
    photo_pattern: decrypt(data.photo_pattern, "jim"),
  };
}

function formatJIMFormData(data: any) {
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

async function lookupJIMIdentity(idNum: string) {
  const db = initializeJIM();

  if (!idNum) return null;

  const normalizedPassport = idNum.trim();
  const lookupHash = hashLookup(normalizedPassport);

  const querySnapshot = await db
    .collection(JIM_NONRESIDENTS_COLLECTION)
    .where("lookup_hash", "==", lookupHash)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  const encryptedData = querySnapshot.docs[0].data();
  const decryptedData = decryptJIMData(encryptedData);

  return {
    source: "jim",
    identity: decryptedData,
    formData: formatJIMFormData(decryptedData),
  };
}

export { lookupJIMIdentity };