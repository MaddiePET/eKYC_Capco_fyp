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
      console.log("[JIM] Reusing existing Firebase app");
      jimApp = existingApp;
    } else {
      let serviceAccount;
      console.log("[JIM] initializeJIM called");
      console.log(
        "[JIM] Existing Firebase apps:",
        admin.apps.map((a) => (a ? a.name : "<null app>"))
      );

      if (process.env.FIREBASE_JIM_SERVICE_ACCOUNT_B64) {
        console.log("[JIM] Using FIREBASE_JIM_SERVICE_ACCOUNT_B64");

        try {
          const decoded = Buffer
            .from(process.env.FIREBASE_JIM_SERVICE_ACCOUNT_B64, "base64")
            .toString("utf8");

          console.log("[JIM] Decoded JSON length:", decoded.length);

          serviceAccount = JSON.parse(decoded);

          console.log(
            "[JIM] Parsed service account for project:",
            serviceAccount.project_id
          );
        } catch (err) {
          console.error("[JIM] Failed parsing B64:", err);
          throw err;
        }
      } else if (process.env.FIREBASE_JIM_SERVICE_ACCOUNT) {
        console.log("[JIM] Using FIREBASE_JIM_SERVICE_ACCOUNT");

        serviceAccount = JSON.parse(
          process.env.FIREBASE_JIM_SERVICE_ACCOUNT
        );

        console.log(
          "[JIM] Parsed service account for project:",
          serviceAccount.project_id
        );
      } else {
        console.log("[JIM] Using local service account file");
        // Fall back to local file (for local development)
        const serviceAccountPath = path.join(
          process.cwd(),
          "jim-db",
          "serviceAccountKey-JIM.json"
        );

        serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, "utf8")
        );
      }

      try {
        console.log("[JIM] Initializing Firebase Admin");

        jimApp = admin.initializeApp(
          {
            credential: admin.credential.cert(serviceAccount),
          },
          appName
        );

        console.log("[JIM] Firebase Admin initialized");
      } catch (err) {
        console.error("[JIM] Failed to initialize Firebase app:", err);
        throw err;
      }
    }
    jimDb = jimApp.firestore();
    console.log("[JIM] Firestore ready");
    if (!jimDb) {
      throw new Error(
        "[JIM] Firestore initialization failed"
      );
    }
  }

  return jimDb;
}

const JIM_NONRESIDENTS_COLLECTION = "jim_nonresidents";

function getGenderFromSex(sex?: string) {
  const normalizedSex = sex?.toLowerCase();

  if (normalizedSex === "male" || normalizedSex === "m") {
    return "M";
  }

  if (normalizedSex === "female" || normalizedSex === "f") {
    return "F";
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
    gender: getGenderFromSex(data.sex),
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

  console.log(`\n[JIM API]`);
  console.log("[JIM] Lookup requested");

  const normalizedPassport = idNum.trim();
  const lookupHash = hashLookup(normalizedPassport);

  console.log(`Generated Index Hash: ${lookupHash}`);

  console.log("[JIM] Querying collection:", JIM_NONRESIDENTS_COLLECTION);

  const querySnapshot = await db
    .collection(JIM_NONRESIDENTS_COLLECTION)
    .where("lookup_hash", "==", lookupHash)
    .limit(1)
    .get();

  console.log(
    "[JIM] Query returned docs:",
    querySnapshot.size
  );

  if (querySnapshot.empty) {
    console.log(`[VERIFICATION FAILED] Record mismatch. No matching entry found for hash: ${lookupHash}`);
    return null;
  }

  console.log(`[MATCH FOUND]`);

  const encryptedData = querySnapshot.docs[0].data();
  const decryptedData = decryptJIMData(encryptedData);

  console.log("[JIM] Record found");
  // console.log(`Full Name: ${decryptedData.full_name}`);
  // console.log(`Birth Date: ${decryptedData.date_of_birth}`);
  // console.log(`Sex: ${decryptedData.sex}`);
  // console.log(`Nationality: ${decryptedData.nationality}`);
  // console.log(`Country: ${decryptedData.country}`);
  // console.log(`Issue Date: ${decryptedData.issue_date}`);
  // console.log(`Expiry Date: ${decryptedData.exp_date}`);
  // console.log(`Issuing Office: ${decryptedData.issue_office}`);
  // console.log(`Visa Type: ${decryptedData.visa_type}\n`);

  return {
    source: "jim",
    identity: decryptedData,
    formData: formatJIMFormData(decryptedData),
  };
}

export { lookupJIMIdentity };