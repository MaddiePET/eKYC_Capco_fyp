import * as admin from "firebase-admin";
import { decrypt, hashLookup } from "../lib/cryptoSecurity";

let jpnApp: admin.app.App;
let jpnDb: FirebaseFirestore.Firestore;

function getServiceAccount() {
  if (process.env.FIREBASE_JPN_SERVICE_ACCOUNT_B64) {
    return JSON.parse(
      Buffer.from(
        process.env.FIREBASE_JPN_SERVICE_ACCOUNT_B64,
        "base64"
      ).toString("utf8")
    );
  }

  if (process.env.FIREBASE_JPN_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_JPN_SERVICE_ACCOUNT);
  }

  throw new Error("Missing JPN Firebase service account credentials");
}

function initializeJPN() {
  if (jpnDb) return jpnDb;

  const appName = "jpn-api-app";

  const existingApp = admin.apps.find(app => app?.name === appName);

  if (existingApp) {
    jpnApp = existingApp;
  } else {
    const serviceAccount = getServiceAccount();

    jpnApp = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
      },
      appName
    );
  }

  jpnDb = jpnApp.firestore();
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