import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { encrypt, hashLookup } from "../lib/cryptoSecurity";

type JimResident = {
  passport_no?: string;
  full_name?: string;
  date_of_birth?: string;
  sex?: string;
  exp_date?: string;
  nationality?: string;
  country?: string;
  issue_date?: string;
  issue_office?: string;
  passport_photo?: string;
  visa_type?: string;
  photo_pattern?: string;
};

type JimTemplate = {
  passport_no?: string;
  photo_pattern?: string;
};

const keyPath = path.join(
  process.cwd(),
  "jim-db",
  "serviceAccountKey-JIM.json"
);

const jsonPath = path.join(
  process.cwd(),
  "jim-db",
  "JIM_json.json"
);

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function uploadJIM() {
  try {
    const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const jimSchema = JSON.parse(rawData[0].jim_schema_export);

    const residents: JimResident[] = jimSchema.jim_nonresidents;
    const templates: JimTemplate[] = jimSchema.face_templates;

    console.log(
      `Found ${residents.length} residents and ${templates.length} templates.`
    );

    const batch = db.batch();

    residents.forEach((person, index) => {
      if (!person.passport_no) {
        console.error(`Resident at index ${index} is missing passport_no!`);
        return;
      }

      const normalizedPassport = person.passport_no.trim();
      const lookupHash = hashLookup(normalizedPassport);
      const docRef = db.collection("jim_nonresidents").doc(lookupHash);

      batch.set(docRef, {
        lookup_hash: lookupHash,

        passport_no: encrypt(normalizedPassport, "jim"),
        full_name: encrypt(person.full_name || "", "jim"),
        date_of_birth: encrypt(person.date_of_birth || "", "jim"),
        sex: encrypt(person.sex || "", "jim"),
        exp_date: encrypt(person.exp_date || "", "jim"),
        nationality: encrypt(person.nationality || "", "jim"),
        country: encrypt(person.country || "", "jim"),
        issue_date: encrypt(person.issue_date || "", "jim"),
        issue_office: encrypt(person.issue_office || "", "jim"),
        passport_photo: encrypt(person.passport_photo || "", "jim"),
        visa_type: encrypt(person.visa_type || "", "jim"),
        photo_pattern: encrypt(person.photo_pattern || "", "jim"),

        created_at: new Date().toISOString(),
      },
        { merge: true }
      );
    });

    templates.forEach((template, index) => {
      if (!template.passport_no) {
        console.error(`Template at index ${index} is missing passport_no!`);
        return;
      }

      const normalizedPassport = template.passport_no.trim();
      const lookupHash = hashLookup(normalizedPassport);
      const docRef = db.collection("face_templates_jim").doc(lookupHash);

      batch.set(docRef, {
        lookup_hash: lookupHash,
        passport_no: encrypt(normalizedPassport, "jim"),
        photo_pattern: encrypt(template.photo_pattern || "", "jim"),
        created_at: new Date().toISOString(),
      }, 
        { merge: true }
      );
    });

    await batch.commit();

    console.log(
      "Success! JIM data uploaded with hashed document ID, lookup_hash, and encrypted fields."
    );
  } catch (error) {
    console.error("JIM migration failed:", error);
    process.exit(1);
  }
}

uploadJIM();
