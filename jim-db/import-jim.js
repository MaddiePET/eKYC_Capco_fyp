import path from "path";
import fs from "fs";

/* eslint-disable @typescript-eslint/no-require-imports */
import path from "path";
import fs from "fs";

const admin = require('firebase-admin');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const keyPath = path.join(
  process.cwd(),
  'jim-db',
  'serviceAccountKey-JIM.json'
);

const serviceAccount = JSON.parse(
  fs.readFileSync(keyPath, 'utf8')
);

const keyPath = path.join(process.cwd(), 'jim-db', 'serviceAccountKey-JIM.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function generateHashID(identifier) {
  return crypto.createHash('sha256').update(identifier).digest('hex');
}
async function uploadJIM() {
  try {
    const rawData = JSON.parse(fs.readFileSync('JIM_json.json', 'utf8'));
    
    // Parse the JIM specific schema string
    const jimSchema = JSON.parse(rawData[0].jim_schema_export);
    const residents = jimSchema.jim_nonresidents;
    const templates = jimSchema.face_templates;

    console.log(`Found ${residents.length} residents and ${templates.length} templates.`);

    const batch = db.batch();

    // 1. Upload Non-residents (using HashID of passport_no as Document ID)
    residents.forEach((person) => {
      const hashedID = generateHashID(person.passport_no);
      const docRef = db.collection('jim_nonresidents').doc(hashedID);
      batch.set(docRef, person);
    });

    // 2. Upload Face Templates using Hashed Passport No as Document ID
    templates.forEach((template) => {
      const hashedID = generateHashID(template.passport_no);
      const docRef = db.collection('face_templates_jim').doc(hashedID);
      batch.set(docRef, template);
    });

    await batch.commit();
    console.log('Success! JIM data uploaded to Firestore with Deterministic Hashed IDs.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

uploadJIM();