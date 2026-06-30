// THIS IS A ONE-TIME DATA MIGRATION SCRIPT
// DO NOT DEPLOY OR RUN IN PRODUCTION ENVIRONMENT

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const keyPath = path.join(
  process.cwd(),
  "ssm-db",
  "serviceAccountKey-SSM.json"
);

// LOCAL ONLY SCRIPT
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();