import admin from "firebase-admin";
import fs from "fs";
import path from "path";

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

  const personSnapshot = await db
    .collection("ssm_business_person")
    .where("ic_number", "==", cleanedIC)
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
      brn: company.registration_number || person.registration_number || "",
      name: company.business_name || company.company_name || "",
      type: company.business_type || "",
      start_date: company.business_start_date || "",
      msicCode: company.msic_code || "",
      msicName: company.msic_name || "",

      address: {
        addressLine1: company.bus_add1 || "",
        addressLine2: company.bus_addr2 || "",
        postcode: company.bus_postcode || "",
        state: company.bus_state || "",
        country: "Malaysia",
      },

    });
  }
  console.log("SSM businesses returned:", businesses);
  return businesses;
}