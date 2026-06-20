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

  let serviceAccount;

  if (process.env.FIREBASE_SSM_SERVICE_ACCOUNT_B64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SSM_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
      serviceAccount = JSON.parse(decoded);
    } catch (err) {
      console.error("Failed to parse FIREBASE_SSM_SERVICE_ACCOUNT_B64 env var:", err);
      throw new Error("Invalid FIREBASE_SSM_SERVICE_ACCOUNT_B64");
    }
  } else if (process.env.FIREBASE_SSM_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SSM_SERVICE_ACCOUNT);
    } catch (err) {
      console.error("Failed to parse FIREBASE_SSM_SERVICE_ACCOUNT env var:", err);
      throw new Error("Invalid FIREBASE_SSM_SERVICE_ACCOUNT JSON");
    }
  } else {
    const keyPath = path.join(
      process.cwd(),
      "ssm-db",
      "serviceAccountKey-SSM.json"
    );

    serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  }

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

  const hashedICIndex = hashLookup(cleanedIC);

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