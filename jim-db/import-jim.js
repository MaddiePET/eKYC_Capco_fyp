/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey-JIM.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadJIM() {
  try {
    const rawData = JSON.parse(fs.readFileSync('JIM_json.json', 'utf8'));
    
    // Parse the JIM specific schema string
    const jimSchema = JSON.parse(rawData[0].jim_schema_export);
    const residents = jimSchema.jim_nonresidents;
    const templates = jimSchema.face_templates;

    console.log(`Found ${residents.length} residents and ${templates.length} templates.`);

    const batch = db.batch();

    // 1. Upload Non-residents (using passport_no as ID)
    residents.forEach((person) => {
      const docRef = db.collection('jim_nonresidents').doc(person.passport_no);
      batch.set(docRef, person);
    });

    // 2. Upload Face Templates
    templates.forEach((template) => {
      const docRef = db.collection('face_templates_jim').doc(template.passport_no);
      batch.set(docRef, template);
    });

    await batch.commit();
    console.log('Success! JIM data uploaded to Firestore.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

uploadJIM();