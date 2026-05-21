import admin from 'firebase-admin';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const keyPath = path.join(
  process.cwd(),
  'ssm-db',
  'serviceAccountKey-SSM.json'
);

const serviceAccount = JSON.parse(
  fs.readFileSync(keyPath, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function generateHashID(identifier) {
  return crypto
    .createHash('sha256')
    .update(String(identifier))
    .digest('hex');
}

async function uploadSSM() {
  try {
    const rawData = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'ssm-db', 'SSM_json_encrypted.json'),
        'utf8'
      )
    );

    const ssmSchema = JSON.parse(rawData[0].ssm_schema_export);

    const companies = ssmSchema.ssm_company || [];
    const businessPeople = ssmSchema.ssm_business_person || [];

    console.log(
      `Found ${companies.length} companies and ${businessPeople.length} business person records.`
    );

    const batch = db.batch();

    // Upload SSM companies using the pre-computed surrogate_key
    companies.forEach((company) => {
      if (!company.surrogate_key) {
        console.log('Skipped company because surrogate_key is missing.');
        return;
      }

      const docRef = db.collection('ssm_company').doc(company.surrogate_key);
      batch.set(docRef, company);
    });

    // Upload SSM business people using their pre-computed surrogate_key
    businessPeople.forEach((person) => {
      if (!person.surrogate_key) {
        console.log('Skipped business person because surrogate_key is missing.');
        return;
      }

      const docRef = db.collection('ssm_business_person').doc(person.surrogate_key);
      batch.set(docRef, person);
    });

    await batch.commit();
    console.log('Success! SSM data uploaded to Firestore with synchronized surrogate keys. 🚀');
  } catch (error) {
    console.error('SSM migration failed:', error);
  }
}

uploadSSM();