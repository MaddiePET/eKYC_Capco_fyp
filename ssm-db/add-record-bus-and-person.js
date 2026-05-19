/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey-SSM.json');

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

// EDIT THIS PART ONLY
const companyData = {
  registration_number: '201501000101 (1000101-A)',
  business_name: 'Ash Trading',
  company_name: 'Ash Trading',
  business_type: 'Sole Proprietorship',
  start_date: '2015-01-01',
  msic_code: '47110',
  msic_name: 'Retail sale in non-specialised stores',
  status: 'Active'
};

const businessPersonData = {
  ic_number: '030909102074',
  full_name: 'Ashley Tang Way Yan',
  role: 'Owner',
  date_of_birth: '2003-09-09',
  gender: "Female",
  race: "Chinese"
};
// EDIT UNTIL HERE

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