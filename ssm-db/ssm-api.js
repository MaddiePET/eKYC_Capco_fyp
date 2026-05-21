import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { hashLookup, decrypt } from "@/lib/cryptoSecurity";

function cleanIC(icNumber) {
  return String(icNumber || "").replace(/-/g, "");
}

function getSSMFirestore() {
  const appName = "ssm-app";

  const existingApp = admin.apps.find((app) => app?.name === appName);

  if (existingApp) {
    return existingApp.firestore();
  }

  const keyPath = path.join(
    process.cwd(),
    "ssm-db",
    "serviceAccountKey-SSM.json"
  );

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

  const ssmApp = admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
    },
    appName
  );

  return ssmApp.firestore();
}

export async function lookupSSMBusinesses(icNumber) {
  if (!icNumber) {
    return [];
  }

  const cleanedIC = cleanIC(icNumber);
  const db = getSSMFirestore();

  // Convert the raw user IC input into the exact deterministic SHA-256 search fingerprint
  const hashedICIndex = hashLookup(cleanedIC);

  // Query the database using the blind index column instead of the plaintext field
  const personSnapshot = await db
    .collection("ssm_business_person")
    .where("ic_number_hash", "==", hashedICIndex)
    .get();

  if (personSnapshot.empty) {
    return [];
  }

  const businesses = [];

  for (const personDoc of personSnapshot.docs) {
    const person = personDoc.data();

    const companySurrogateKey = person.company_surrogate_key;

    if (!companySurrogateKey) {
      continue;
    }

    const companyDoc = await db
      .collection("ssm_company")
      .doc(companySurrogateKey)
      .get();

    if (!companyDoc.exists) {
      continue;
    }

    const company = companyDoc.data();

    console.log("SSM company data:", company);

    // Decrypt the corporate strings using the "ssm" key identifier before sending to the client UI
    businesses.push({
      id: companySurrogateKey,
      brn: decrypt(company.registration_number, "ssm"),
      name: decrypt(company.business_name || company.company_name, "ssm"),
      type: decrypt(company.business_type, "ssm"), 
      start_date: decrypt(company.start_date || company.business_start_date, "ssm"),
      msicCode: company.msic_code || "",
      msicName: company.msic_name || "",

      address: {
        addressLine1: decrypt(company.bus_add1, "ssm"),
        addressLine2: decrypt(company.bus_addr2, "ssm"),
        postcode: decrypt(company.bus_postcode, "ssm"),
        state: decrypt(company.bus_state, "ssm"),
        country: "Malaysia",
      },
    });
  }
  console.log("SSM businesses returned:", businesses);
  return businesses;
}