import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { encrypt, hashLookup } from "@/lib/cryptoSecurity";

dotenv.config({ path: ".env.local" });

function cleanIC(icNumber) {
  return String(icNumber || "").replace(/-/g, "").trim();
}

async function encryptSsmJsonFile() {
  try {
    console.log(
      "SSM KEY HASH:",
      crypto
        .createHash("sha256")
        .update(process.env.SSM_ENCRYPTION_KEY || "")
        .digest("hex")
    );
    const inputPath = path.join(process.cwd(), "ssm-db", "SSM_json.json");
    const outputPath = path.join(process.cwd(), "ssm-db", "SSM_json_encrypted.json");

    console.log("Reading unencrypted SSM source records...");
    const rawWrapperData = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    
    const ssmSchema = JSON.parse(rawWrapperData[0].ssm_schema_export);
    
    const plainCompanies = ssmSchema.ssm_company || [];
    const plainPeople = ssmSchema.ssm_business_person || [];

    console.log(`Encrypting ${plainCompanies.length} company and ${plainPeople.length} business profile records...`);

    const encryptedCompanies = plainCompanies.map((company) => {
      const regNo = company.registration_number || "";
      return {
        ...company,
        surrogate_key: hashLookup(regNo),                     
        registration_number: encrypt(regNo, "ssm"),        
        business_name: encrypt(company.business_name || company.company_name, "ssm"),
        company_name: encrypt(company.company_name || company.business_name, "ssm"),
        bus_add1: encrypt(company.bus_add1, "ssm"),
        bus_addr2: encrypt(company.bus_addr2, "ssm"),
        bus_postcode: encrypt(company.bus_postcode, "ssm"),
        bus_state: encrypt(company.bus_state, "ssm"),
        msic_code: company.msic_code || "", 
        msic_name: company.msic_name || "",
        business_type: company.business_type || "",
        status: company.status || "Active"
      };
    });

    const encryptedPeople = plainPeople.map((person) => {
      const regNo = person.registration_number || "";
      const cleanedIC = cleanIC(person.ic_number);
      
      return {
        ...person,
        surrogate_key: hashLookup(`${regNo}-${cleanedIC}`),
        company_surrogate_key: hashLookup(regNo),          
        ic_number_hash: hashLookup(cleanedIC),            
        ic_number: encrypt(cleanedIC, "ssm"),           
        registration_number: encrypt(regNo, "ssm"), 
        full_name: encrypt(person.full_name, "ssm"),
        date_of_birth: person.date_of_birth || "",
        role: person.role || "Partner",
        gender: person.gender || "",
        race: person.race || ""
      };
    });

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
    console.log("Success! Encrypted file created at: ssm-db/SSM_json_encrypted.json");

  } catch (error) {
    console.error("Encryption migration routine failed:", error);
  }
}

encryptSsmJsonFile();