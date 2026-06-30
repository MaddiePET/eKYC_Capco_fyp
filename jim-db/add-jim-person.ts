import dotenv from 'dotenv';
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey-JIM.json';
import { encrypt, hashLookup } from '../lib/cryptoSecurity';

dotenv.config({ path: '.env.local' });

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
}

const db = getFirestore();

const personData = {
  passport_no: 'A38716565',
  full_name: 'JAIND RAAJ SINGH',
  date_of_birth: '2001-12-26',
  sex: 'M',
  exp_date: '2021-09-02',
  nationality: 'MALAYSIA',
  country: 'MYS',
  issue_date: '2016-09-02',
  issue_office: 'SHAH ALAM',
  passport_photo: '\\xffd8ffe000104a464946',
  visa_type: 'Tourist',
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

