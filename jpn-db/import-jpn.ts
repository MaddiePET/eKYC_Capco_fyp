import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { encrypt, hashLookup } from "../lib/cryptoSecurity";

type JpnCitizen = {
  ic_number?: string;
  full_name?: string;
  date_of_birth?: string;
  sex?: string;
  phone_registered?: string;
  add1?: string;
  add2?: string;
  postcode?: string;
  state?: string;
  ic_photo?: string;
  photo_pattern?: string;
};

type JpnTemplate = {
  ic_number?: string;
  photo_pattern?: string;
};

const keyPath = path.join(
  process.cwd(),
  "jpn-db",
  "serviceAccountKey-JPN.json"
);

const jsonPath = path.join(
  process.cwd(),
  "jpn-db",
  "JPN_json.json"
);

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function uploadJPN() {
  try {
    const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const jpnSchema = JSON.parse(rawData[0].jpn_schema_export);

    const citizens: JpnCitizen[] = jpnSchema.jpn_citizens;
    const templates: JpnTemplate[] = jpnSchema.face_templates;

    console.log(`Found ${citizens.length} citizens and ${templates.length} templates.`);

    const batch = db.batch();

    citizens.forEach((citizen, index) => {
      if (!citizen.ic_number) {
        console.error(`Citizen at index ${index} is missing ic_number!`);
        return;
      }

      const normalizedIc = citizen.ic_number.replace(/-/g, "").trim();
      const lookupHash = hashLookup(normalizedIc);
      const docRef = db.collection("jpn_citizens").doc(lookupHash);

      batch.set(docRef, {
        lookup_hash: lookupHash,
        ic_number: encrypt(normalizedIc, "jpn"),
        full_name: encrypt(citizen.full_name || "", "jpn"),
        date_of_birth: encrypt(citizen.date_of_birth || "", "jpn"),
        sex: encrypt(citizen.sex || "Unknown", "jpn"),
        phone_registered: encrypt(citizen.phone_registered || "", "jpn"),
        add1: encrypt(citizen.add1 || "", "jpn"),
        add2: encrypt(citizen.add2 || "", "jpn"),
        postcode: encrypt(citizen.postcode || "", "jpn"),
        state: encrypt(citizen.state || "", "jpn"),
        ic_photo: encrypt(citizen.ic_photo || "", "jpn"),
        photo_pattern: encrypt(citizen.photo_pattern || "", "jpn"),
      },
        { merge: true }
      );
    });

    templates.forEach((template, index) => {
      if (!template.ic_number) {
        console.error(`Template at index ${index} is missing ic_number!`);
        return;
      }

      const normalizedIc = template.ic_number.replace(/-/g, "").trim();
      const lookupHash = hashLookup(normalizedIc);
      const docRef = db.collection("face_templates_jpn").doc(lookupHash);

      batch.set(docRef, {
        lookup_hash: lookupHash,
        ic_number: encrypt(normalizedIc, "jpn"),
        photo_pattern: encrypt(template.photo_pattern || "", "jpn"),
      },
        { merge: true }
      );
    });

    await batch.commit();

    console.log("Success! JPN data uploaded with hashed document ID, lookup_hash, and encrypted fields.");
  } catch (error) {
    console.error("JPN migration failed:", error);
    process.exit(1);
  }
}

uploadJPN();