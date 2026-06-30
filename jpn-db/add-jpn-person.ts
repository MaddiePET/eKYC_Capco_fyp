import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { encrypt, hashLookup } from "../lib/cryptoSecurity";

const serviceAccount = JSON.parse(
  Buffer.from(
    process.env.FIREBASE_JPN_SERVICE_ACCOUNT_B64!,
    "base64"
  ).toString("utf8")
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const personData = {
  ic_number: "1234567890",
  full_name: "YOUR NAME",
  date_of_birth: "2000-12-06",
  sex: "lelaki",
  phone_registered: "123241311",
  add1: "YOUR ADDRESS LINE 1",
  add2: "YOUR ADDRESS LINE 2",
  postcode: "12345",
  state: "YOUR STATE",
  ic_photo: "\\xffd8ffe000104a464946",
  photo_pattern: "ABC123",
};

async function addSinglePerson() {
  try {
    const lookupHash = hashLookup(personData.ic_number);

    console.log(`Generating lookup hash for ${personData.ic_number}...`);
    console.log(`Lookup Hash: ${lookupHash}`);

    // Store encrypted fields and a lookup hash so the API can find this record
    const encrypted = {
      ic_number: encrypt(personData.ic_number, 'jpn'),
      full_name: encrypt(personData.full_name, 'jpn'),
      date_of_birth: encrypt(personData.date_of_birth, 'jpn'),
      sex: encrypt(personData.sex || '', 'jpn'),
      phone_registered: encrypt(personData.phone_registered, 'jpn'),
      add1: encrypt(personData.add1, 'jpn'),
      add2: encrypt(personData.add2, 'jpn'),
      postcode: encrypt(personData.postcode, 'jpn'),
      state: encrypt(personData.state, 'jpn'),
      ic_photo: encrypt(personData.ic_photo, 'jpn'),
      photo_pattern: encrypt(personData.photo_pattern, 'jpn'),
      lookup_hash: hashLookup(personData.ic_number),
    };

    await db.collection('jpn_citizens').doc(lookupHash).set(encrypted);

    console.log(`Successfully added ${personData.full_name} to JPN database!`);
    process.exit(0);
  } catch (error) {
    console.error("Error adding person:", error);
    process.exit(1);
  }
}

addSinglePerson();