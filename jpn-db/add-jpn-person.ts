import dotenv from 'dotenv';
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey-JPN.json';
import { encrypt, hashLookup } from '../lib/cryptoSecurity';

dotenv.config({ path: '.env.local' });

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount)
  });
}

const db = getFirestore();

const personData = {
  ic_number: "041206100535",
  full_name: "SAMUEL HO SHENHAO",
  date_of_birth: "2004-12-06",
  sex: "lelaki",
  phone_registered: "173010270",
  add1: "C-208 SD Apartment 2, Persiaran Meranti",
  add2: "Bandar Sri Damansara, W. Persekutan Kuala Lumpur",
  postcode: "52200",
  state: "Kuala Lumpur",
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