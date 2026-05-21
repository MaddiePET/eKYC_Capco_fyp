import admin from 'firebase-admin';
import crypto from 'crypto';
import fs from 'fs';
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
  registration_number: '329042348032 (4000101-A)',
  business_name: 'Ash Trevino Sdn Bhd',
  company_name: 'Ash Trevino Sdn Bhd',
  business_type: 'Sole Proprietorship',
  start_date: '2020-10-10',
  msic_code: '47110',
  msic_name: 'Software Development and Programming Activities',
  status: 'Active',
  bus_add1: 'No 65, Jalan Alpha',
  bus_addr2: 'Bandar Alpha',
  bus_postcode: '80120',
  bus_state: 'Johor',
  country: 'Malaysia',
};

const businessPersonData = {
  ic_number: 'X3852717',
  full_name: 'Gabriella Tio Pardede',
  role: 'Owner',
  date_of_birth: '2004-10-12',
  gender: "Female",
  race: "Non-Malaysian"
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

    const finalCompanyData = {
      ...companyData,
      surrogate_key: companySurrogateKey,
      created_at: new Date().toISOString()
    };

    const finalBusinessPersonData = {
      ...businessPersonData,
      ic_number: icNumber,
      registration_number: registrationNumber,
      surrogate_key: personSurrogateKey,
      company_surrogate_key: companySurrogateKey,
      created_at: new Date().toISOString()
    };

    console.log(`Generating company ID for ${registrationNumber}...`);
    console.log(`Company Hash ID: ${companySurrogateKey}`);

    console.log(`Generating business person ID for ${icNumber}...`);
    console.log(`Person Hash ID: ${personSurrogateKey}`);

    await db.collection('ssm_company')
      .doc(companySurrogateKey)
      .set(finalCompanyData, { merge: true });

    await db.collection('ssm_business_person')
      .doc(personSurrogateKey)
      .set(finalBusinessPersonData, { merge: true });

    console.log('Successfully added SSM company and business person record!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding SSM record:', error);
    process.exit(1);
  }
}

addSSMRecord();