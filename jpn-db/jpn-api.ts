import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { decrypt, hashLookup } from "../lib/cryptoSecurity";

let jpnApp: admin.app.App | undefined;
let jpnDb: FirebaseFirestore.Firestore | undefined;

function initializeJPN() {
  if (!jpnDb) {
    const appName = "jpn-api-app";

    const existingApp = admin.apps.find((app) => app?.name === appName);

    if (existingApp) {
      jpnApp = existingApp;
    } else {
      let serviceAccount;

      if (process.env.FIREBASE_JPN_SERVICE_ACCOUNT_B64) {
        try {
          const decoded = Buffer.from(process.env.FIREBASE_JPN_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
          serviceAccount = JSON.parse(decoded);
        } catch (err) {
          console.error("Failed to parse FIREBASE_JPN_SERVICE_ACCOUNT_B64 env var:", err);
          throw new Error("Invalid FIREBASE_JPN_SERVICE_ACCOUNT_B64");
        }
      } else if (process.env.FIREBASE_JPN_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_JPN_SERVICE_ACCOUNT);
        } catch (err) {
          console.error("Failed to parse FIREBASE_JPN_SERVICE_ACCOUNT env var:", err);
          throw new Error("Invalid FIREBASE_JPN_SERVICE_ACCOUNT JSON");
        }
      } else {
        // Fall back to local file (for local development)
        const serviceAccountPath = path.join(
          process.cwd(),
          "jpn-db",
          "serviceAccountKey-JPN.json"
        );

        serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, "utf8")
        );
      }

      try {
        jpnApp = admin.initializeApp(
          {
            credential: admin.credential.cert(serviceAccount),
          },
          appName
        );
      } catch (err) {
        console.error("Failed to initialize Firebase JPN app:", err);
        throw err;
      }
    }

    jpnDb = jpnApp.firestore();
  }

  return jpnDb;
}

const JPN_CITIZENS_COLLECTION = "jpn_citizens";

function getGenderFromSex(sex?: string) {
  const normalizedSex = sex?.toLowerCase();

  if (normalizedSex === "lelaki" || normalizedSex === "male" || normalizedSex === "m") {
    return "M";
  }

  if (normalizedSex === "perempuan" || normalizedSex === "female" || normalizedSex === "f") {
    return "F";
  }

  return "";
}

function decryptJPNData(data: any) {
  return {
    ic_number: decrypt(data.ic_number, "jpn"),
    full_name: decrypt(data.full_name, "jpn"),
    date_of_birth: decrypt(data.date_of_birth, "jpn"),
    sex: decrypt(data.sex, "jpn"),
    phone_registered: decrypt(data.phone_registered, "jpn"),
    add1: decrypt(data.add1, "jpn"),
    add2: decrypt(data.add2, "jpn"),
    postcode: decrypt(data.postcode, "jpn"),
    state: decrypt(data.state, "jpn"),
    ic_photo: decrypt(data.ic_photo, "jpn"),
    photo_pattern: decrypt(data.photo_pattern, "jpn"),
  };
}

function formatJPNFormData(data: any) {
  return {
    id_type: "mykad",
    id_number: data.ic_number,
    gender: getGenderFromSex(data.sex),
    full_name: data.full_name,
    date_of_birth: data.date_of_birth,
    phone_number: data.phone_registered,
    address_line_1: data.add1,
    address_line_2: data.add2,
    postcode: data.postcode,
    state: data.state,
    country: "Malaysia",
    ic_photo: data.ic_photo || null,
    photo_pattern: data.photo_pattern || null,
  };
}

async function lookupJPNIdentity(idNum: string) {
  const db = initializeJPN();

  if (!idNum) return null;
  console.log(`\n[JPN API]`);
  console.log(`Plaintext Parameter Extracted: "${idNum}"`);

  const normalizedId = idNum.replace(/-/g, "").trim();
  const lookupHash = hashLookup(normalizedId);

  console.log(`Generated Index Hash: ${lookupHash}`);

  const querySnapshot = await db
    .collection(JPN_CITIZENS_COLLECTION)
    .where("lookup_hash", "==", lookupHash)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    console.log(`[VERIFICATION FAILED] Record mismatch. No matching entry found for hash: ${lookupHash}`);
    return null;
  }

  console.log(`[MATCH FOUND]`);

  const encryptedData = querySnapshot.docs[0].data();
  const decryptedData = decryptJPNData(encryptedData);

  console.log(`Full Name: ${decryptedData.full_name}`);
  console.log(`Birth Date: ${decryptedData.date_of_birth}`);
  console.log(`Sex: ${decryptedData.sex}`);
  console.log(`Phone Registered: ${decryptedData.phone_registered}`);
  console.log(`Full Address: ${decryptedData.add1}, ${decryptedData.add2}`);
  console.log(`Postcode: ${decryptedData.postcode}`);
  console.log(`State: ${decryptedData.state}\n`);

  return {
    source: "jpn",
    identity: decryptedData,
    formData: formatJPNFormData(decryptedData),
  };
}

export { lookupJPNIdentity };