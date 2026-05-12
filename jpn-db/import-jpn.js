/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');
const fs = require('fs');
const crypto = require('crypto');

const path = require('path');

const keyPath = path.join(
  process.cwd(),
  'jpn-db',
  'serviceAccountKey-JPN.json'
);

const serviceAccount = JSON.parse(
  fs.readFileSync(keyPath, 'utf8')
);

function generateHashID(identifier) {
  return crypto.createHash('sha256').update(identifier).digest('hex');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadJPN() {
  try {
    const rawData = JSON.parse(fs.readFileSync('JPN_json.json', 'utf8'));
    const jpnSchema = JSON.parse(rawData[0].jpn_schema_export);
    const citizens = jpnSchema.jpn_citizens;
    const templates = jpnSchema.face_templates;

    console.log(`Found ${citizens.length} citizens and ${templates.length} templates.`);

    // Use a batch to upload multiple records efficiently
    const batch = db.batch();

    // Upload Citizens with Deterministic Hashed IDs
    citizens.forEach((citizen, index) => {
      if (!citizen.ic_number) {
        console.error(`Citizen at index ${index} is missing ic_number!`);
        return;
      }
      const hashedID = generateHashID(citizen.ic_number);
      const docRef = db.collection('jpn_citizens').doc(hashedID);
      batch.set(
        docRef,
        {
          ...citizen,
          sex: citizen.sex || "Unknown",
        },
        { merge: true }
      );
    });

    // Upload Face Templates with Deterministic Hashed IDs
    templates.forEach((template, index) => {
      if (!template.ic_number) {
        console.error(`Template at index ${index} is missing ic_number!`);
        return;
      }
      const hashedID = generateHashID(template.ic_number);
      const docRef = db.collection('face_templates_jpn').doc(hashedID);
      batch.set(docRef, template);
    });

    await batch.commit();
    console.log('Success! JPN data uploaded to Firestore with Deterministic Hashed IDs.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

uploadJPN();