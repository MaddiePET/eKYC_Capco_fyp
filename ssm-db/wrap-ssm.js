import fs from 'fs';
import path from 'path';

const inputPath = path.join(process.cwd(), 'ssm-db', 'SSM_direct.json');
const outputPath = path.join(process.cwd(), 'ssm-db', 'SSM_json.json');

const directData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const wrappedData = [
  {
    ssm_schema_export: JSON.stringify(directData)
  }
];

fs.writeFileSync(outputPath, JSON.stringify(wrappedData, null, 2));

console.log('SSM_json.json created in JIM-style wrapper format.');