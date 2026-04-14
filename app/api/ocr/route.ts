import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const tempFilePath = path.join(tempDir, file.name);
    fs.writeFileSync(tempFilePath, buffer);

    const pythonScriptPath = path.join(process.cwd(), "engines", "ocr_engine.py");
    
    return await new Promise<NextResponse>((resolve) => {
      // Use "python3" for Mac
      const pythonProcess = spawn("python", [pythonScriptPath, tempFilePath]);

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on("data", (data) => { stdout += data.toString(); });
      
      // NEW: Capture the actual error from Python
      pythonProcess.stderr.on("data", (data) => { stderr += data.toString(); });

      pythonProcess.on("close", (code) => {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

        if (code !== 0) {
          console.error("Python Error:", stderr); // This shows in your VS Code terminal
          resolve(NextResponse.json({ error: stderr || "Python script crashed" }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ data: stdout.trim() }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}