import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { encrypt, hashLookup } from "../lib/cryptoSecurity";

const serviceAccount = JSON.parse(
  Buffer.from(
    process.env.FIREBASE_JIM_SERVICE_ACCOUNT_B64!,
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
  passport_no: 'A123244344',
  full_name: 'YOUR NAME',
  date_of_birth: '2000-12-06',
  sex: 'M',
  exp_date: '2029-09-02',
  nationality: 'NATIONALTIY',
  country: 'COUNTRY CODE',
  issue_date: '2016-09-02',
  issue_office: 'ISSUE OFFICE',
  passport_photo: '\\xffd8ffe000104a464946',
  visa_type: 'TOURIST',
  photo_pattern: 'PATTERN123',
};

async function addSingleJimPerson() {
  try {
    const lookupHash = hashLookup(personData.passport_no);

    console.log(`Generating lookup hash for ${personData.passport_no}...`);
    console.log(`Lookup Hash: ${lookupHash}`);

    const encrypted = {
      passport_no: encrypt(personData.passport_no, 'jim'),
      full_name: encrypt(personData.full_name, 'jim'),
      date_of_birth: encrypt(personData.date_of_birth, 'jim'),
      sex: encrypt(personData.sex || '', 'jim'),
      exp_date: encrypt(personData.exp_date || '', 'jim'),
      nationality: encrypt(personData.nationality || '', 'jim'),
      country: encrypt(personData.country || '', 'jim'),
      issue_date: encrypt(personData.issue_date || '', 'jim'),
      issue_office: encrypt(personData.issue_office || '', 'jim'),
      passport_photo: encrypt(personData.passport_photo || '', 'jim'),
      visa_type: encrypt(personData.visa_type || '', 'jim'),
      photo_pattern: encrypt(personData.photo_pattern || '', 'jim'),
      lookup_hash: hashLookup(personData.passport_no),
    };

    await db.collection('jim_nonresidents').doc(lookupHash).set(encrypted);

    console.log(`Successfully added ${personData.full_name} to JIM database!`);
    process.exit(0);
  } catch (error) {
    console.error('Error adding JIM person:', error);
    process.exit(1);
  }
}

addSingleJimPerson();

