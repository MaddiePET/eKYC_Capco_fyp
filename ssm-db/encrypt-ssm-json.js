import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ALGORITHM = "aes-256-gcm";

// 🔐 Helper function mirroring your cryptoSecurity.ts architecture
function getKey(source) {
  const keyHex = source === "banka" ? process.env.BANKA_ENCRYPTION_KEY : process.env.SSM_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error(`Missing local environment encryption key configuration for: ${source}`);
  }
  return Buffer.from(keyHex, "hex");
}

function encrypt(value, source = "banka") {
  if (!value) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(source), iv);
  
  const encrypted = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function hashLookup(value) {
  if (!value) return "";
  const normalized = String(value).replace(/-/g, "").trim().toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function cleanIC(icNumber) {
  return String(icNumber || "").replace(/-/g, "").trim();
}

async function encryptSsmJsonFile() {
  try {
    const inputPath = path.join(process.cwd(), "ssm-db", "SSM_json.json");
    const outputPath = path.join(process.cwd(), "ssm-db", "SSM_json_encrypted.json");

    console.log("Reading unencrypted SSM source records...");
    const rawWrapperData = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    
    // Unpack the inner JSON string embedded inside the ssm_schema_export string wrapper
    const ssmSchema = JSON.parse(rawWrapperData[0].ssm_schema_export);
    
    const plainCompanies = ssmSchema.ssm_company || [];
    const plainPeople = ssmSchema.ssm_business_person || [];

    console.log(`Encrypting ${plainCompanies.length} company and ${plainPeople.length} business profile records...`);

    // 1. Process and scramble corporate company details
    const encryptedCompanies = plainCompanies.map((company) => {
      const regNo = company.registration_number || "";
      return {
        ...company,
        surrogate_key: hashLookup(regNo), // Deterministic PK
        registration_number: encrypt(regNo, "banka"),
        business_name: encrypt(company.business_name || company.company_name, "banka"),
        company_name: encrypt(company.company_name || company.business_name, "banka"),
        bus_add1: encrypt(company.bus_add1, "banka"),
        bus_addr2: encrypt(company.bus_addr2, "banka"),
        bus_postcode: encrypt(company.bus_postcode, "banka"),
        bus_state: encrypt(company.bus_state, "banka"),
        msic_code: company.msic_code || "", // Keeping operational code fields search indexed
        msic_name: company.msic_name || "",
        business_type: company.business_type || "",
        status: company.status || "Active"
      };
    });

    // 2. Process and scramble private business partner personal records
    const encryptedPeople = plainPeople.map((person) => {
      const regNo = person.registration_number || "";
      const cleanedIC = cleanIC(person.ic_number);
      
      return {
        ...person,
        surrogate_key: hashLookup(`${regNo}-${cleanedIC}`), // Unique Composite Person Document ID
        company_surrogate_key: hashLookup(regNo),          // Links back to corporate index hash
        ic_number_hash: hashLookup(cleanedIC),             // Search indexed hash matching government lookup
        ic_number: encrypt(cleanedIC, "banka"),
        registration_number: encrypt(regNo, "banka"),
        full_name: encrypt(person.full_name, "banka"),
        date_of_birth: person.date_of_birth || "",
        role: person.role || "Partner",
        gender: person.gender || "",
        race: person.race || ""
      };
    });

    // Reassemble everything back into your original structural JSON wrapper format
    const encryptedSchema = {
      ssm_company: encryptedCompanies,
      ssm_business_person: encryptedPeople
    };

    const finalOutputWrapper = [
      {
        ssm_schema_export: JSON.stringify(encryptedSchema)
      }
    ];

    fs.writeFileSync(outputPath, JSON.stringify(finalOutputWrapper, null, 2));
    console.log("Success! Encrypted file created at: ssm-db/SSM_json_encrypted.json 🔐");

  } catch (error) {
    console.error("Encryption migration routine failed:", error);
  }
}

encryptSsmJsonFile();