/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey-JPN.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadJPN() {
  try {
    // 1. Read the JSON file exported from TablePlus
    const rawData = JSON.parse(fs.readFileSync('JPN_json.json', 'utf8'));
    
    // 2. Parse the nested string from your specific export format
    const jpnSchema = JSON.parse(rawData[0].jpn_schema_export);
    const citizens = jpnSchema.jpn_citizens;
    const templates = jpnSchema.face_templates;

    console.log(`Found ${citizens.length} citizens and ${templates.length} templates.`);

    const batch = db.batch();

    // 3. Upload Citizens
    citizens.forEach((citizen) => {
      const docRef = db.collection('jpn_citizens').doc(citizen.ic_number);
      batch.set(docRef, citizen);
    });

    // 4. Upload Face Templates
    templates.forEach((template) => {
      const docRef = db.collection('face_templates_jpn').doc(template.ic_number);
      batch.set(docRef, template);
    });

    await batch.commit();
    console.log('Success! JPN data uploaded to Firestore.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

uploadJPN();