const admin = require('firebase-admin');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

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
        path.join(process.cwd(), 'ssm-db', 'SSM_json.json'),
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

    // Upload SSM companies
    companies.forEach((company) => {
      const regNo = company.registration_number;

      if (!regNo) {
        console.log('Skipped company because registration_number is missing.');
        return;
      }

      const companyHashID = generateHashID(regNo);

      const companyDoc = {
        ...company,
        surrogate_key: companyHashID
      };

      const docRef = db
        .collection('ssm_company')
        .doc(companyHashID);

      batch.set(docRef, companyDoc);
    });

    // Upload SSM business people
    businessPeople.forEach((person) => {
      const regNo = person.registration_number;
      const icNumber = person.ic_number;

      if (!regNo || !icNumber) {
        console.log(
          'Skipped business person because registration_number or ic_number is missing.'
        );
        return;
      }

      const companyHashID = generateHashID(regNo);

      // PK / document ID for business person
      // Uses registration number + IC number
      const personHashID = generateHashID(`${regNo}-${icNumber}`);

      const personDoc = {
        ...person,
        surrogate_key: personHashID,
        company_surrogate_key: companyHashID
      };

      const docRef = db
        .collection('ssm_business_person')
        .doc(personHashID);

      batch.set(docRef, personDoc);
    });

    await batch.commit();

    console.log('Success! SSM data uploaded to Firestore with hashed surrogate keys.');
  } catch (error) {
    console.error('SSM migration failed:', error);
  }
}

uploadSSM();