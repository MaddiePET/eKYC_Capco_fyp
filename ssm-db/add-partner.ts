import admin from 'firebase-admin';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const keyPath = path.join(process.cwd(), 'ssm-db', 'serviceAccountKey-SSM.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

function generateHashID(identifier) {
  return crypto
    .createHash('sha256')
    .update(String(identifier))
    .digest('hex');
}

function cleanIC(icNumber) {
  return String(icNumber || '').replace(/-/g, '');
}

const companyData = {
  registration_number: '202001000606 (1000606-A)'

};

const businessPersonData = {
  ic_number: '030909102074',
  full_name: 'Ashley Tang Way Yan',
  role: 'Partner',
  date_of_birth: '2003-09-09',
  gender: "Female",
  race: "Chinese"
};

async function addSSMRecord() {
  try {
    const registrationNumber = companyData.registration_number;
    const icNumber = cleanIC(businessPersonData.ic_number);

    if (!registrationNumber || !icNumber) {
      console.error('registration_number and ic_number are required.');
      process.exit(1);
    }

    const companySurrogateKey = generateHashID(registrationNumber);
    const personSurrogateKey = generateHashID(`${registrationNumber}-${icNumber}`);

    const finalBusinessPersonData = {
      ...businessPersonData,
      ic_number: icNumber,
      registration_number: registrationNumber,
      surrogate_key: personSurrogateKey,
      company_surrogate_key: companySurrogateKey,
    };

    console.log(`Generating business person ID for ${icNumber}...`);
    console.log(`Person Hash ID: ${personSurrogateKey}`);

    await db.collection('ssm_business_person')
      .doc(personSurrogateKey)
      .set(finalBusinessPersonData, { merge: true });

    console.log('Successfully added SSM business partner record!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding SSM record:', error);
    process.exit(1);
  }
}

addSSMRecord();