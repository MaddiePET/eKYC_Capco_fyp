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

function getTitleFromSex(sex?: string) {
  const normalizedSex = sex?.toLowerCase();

  if (normalizedSex === "lelaki" || normalizedSex === "male" || normalizedSex === "m") {
    return "Mr.";
  }

  if (normalizedSex === "perempuan" || normalizedSex === "female" || normalizedSex === "f") {
    return "Ms.";
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
    title: getTitleFromSex(data.sex),
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

  const normalizedId = idNum.replace(/-/g, "").trim();
  const lookupHash = hashLookup(normalizedId);

  const querySnapshot = await db
    .collection(JPN_CITIZENS_COLLECTION)
    .where("lookup_hash", "==", lookupHash)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  const encryptedData = querySnapshot.docs[0].data();
  const decryptedData = decryptJPNData(encryptedData);

  return {
    source: "jpn",
    identity: decryptedData,
    formData: formatJPNFormData(decryptedData),
  };
}

export { lookupJPNIdentity };