import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/scripts/hashpw";
import { decrypt } from "@/lib/cryptoSecurity";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type EmailOtpRecord = {
  otp: string;
  expiresAt: number;
};

declare global {
  var emailOtpStore: Map<string, EmailOtpRecord> | undefined;
}

const emailOtpStore = global.emailOtpStore ?? new Map<string, EmailOtpRecord>();

if (process.env.NODE_ENV !== "production") {
  global.emailOtpStore = emailOtpStore;
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function saveEmailOtp(email: string, otp: string) {
  emailOtpStore.set(normalizeEmail(email), {
    otp: otp.trim(),
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
}

function verifyEmailOtp(email: string, otp: string) {
  const record = emailOtpStore.get(normalizeEmail(email));

  if (!record) {
    return { success: false, message: "OTP not found. Please request a new code." };
  }

  if (Date.now() > record.expiresAt) {
    emailOtpStore.delete(normalizeEmail(email));
    return { success: false, message: "OTP expired. Please request a new code." };
  }

  if (record.otp !== otp.trim()) {
    return { success: false, message: "Invalid OTP code." };
  }

  emailOtpStore.delete(normalizeEmail(email));
  return { success: true, message: "Email verified successfully." };
}

async function sendPasswordResetOtpEmail({ to, otp }: { to: string; otp: string }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Bank A" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Bank A User Password Reset Verification Code`,
    html: `
    <div style="margin:0; padding:0; background-color:#f5f7fb; font-family:Arial, Helvetica, sans-serif;">
      <div style="max-width:560px; margin:0 auto; padding:40px 16px;">
        <div style="background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #d9dce8;">
        
          <div style="background-color:#2c2f42; padding:30px 32px; text-align:center;">
            <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:800; letter-spacing:0.4px;">
              DTCOB Banking Services
            </h1>

            <p style="margin:8px 0 0; color:#c7d2fe; font-size:13px; font-weight:600; letter-spacing:0.4px;">
              Password Reset Request
            </p>
          </div>

          <div style="padding:36px 32px 32px;">
            <p style="margin:0 0 12px; color:#2c2f42; font-size:22px; font-weight:800; text-align:center; letter-spacing:0.2px;">
              Verify your email address
            </p>

            <p style="margin:0 auto 24px; max-width:420px; color:#374151; font-size:14px; line-height:1.7; text-align:center;">
              You have requested to reset your password. Please enter the verification code below to continue with your password reset.
            </p>

            <div style="text-align:center; margin:30px 0;">
              <div style="display:inline-block; background-color:#eef2ff; border:2px solid #3D405B; color:#2c2f42; padding:20px 30px; border-radius:14px;">
                <p style="margin:0 0 8px; color:#4b5563; font-size:13px; font-weight:700; letter-spacing:0.4px;">
                  VERIFICATION CODE
                </p>
                
                <p style="margin:0; color:#2c2f42; font-size:32px; font-weight:800; letter-spacing:6px;">
                  ${otp}
                </p>
              </div>
            </div>

            <p style="margin:0 0 8px; color:#2c2f42; font-size:14px; line-height:1.6; text-align:center;">
              This code will expire in <strong>5 minutes</strong>.
            </p>

            <p style="margin:0 auto; max-width:420px; color:#4b5563; font-size:13px; line-height:1.6; text-align:center;">
              Please keep this email for your reference. If you did not submit this application, please contact Bank A support immediately.
            </p>
          </div>

          <div style="padding:18px 32px; background-color:#f1f2f6; border-top:1px solid #d9dce8; text-align:center;">
            <p style="margin:0; color:#6b7280; font-size:12px; line-height:1.5;">
              This is an automated email from DTCOB Banking Services. Please do not reply.
            </p>
          </div>
        </div>
      </div>
    </div>
    `,
  });
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const { action, username, email, otp, newPassword } = await req.json();

    await client.query("BEGIN");

    if (action === "send_otp") {
      if (!username) {
        return NextResponse.json({ error: "Username is required." }, { status: 400 });
      }

      if (!email) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
      }

      const userResult = await client.query(
        `SELECT u.user_id, c.email 
        FROM banka."User" u
        JOIN banka."Customer" c ON u.cust_id = c.cust_id
        WHERE LOWER(u.username) = LOWER($1)`,
        [username]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: "Username is not found." }, { status: 400 });
      }

      const dbEncryptedEmail = userResult.rows[0].email;
      let dbDecryptedEmail = "";

      try {
        dbDecryptedEmail = decrypt(dbEncryptedEmail, "banka");
      } catch (err) {
        console.error("Failed to decrypt email:", err);
        return NextResponse.json({ error: "Internal server error reading account details." }, { status: 500 });
      }

      if (dbDecryptedEmail.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: "The provided email does not match our records." }, { status: 400 });
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      saveEmailOtp(email, generatedOtp);
      await sendPasswordResetOtpEmail({ to: email, otp: generatedOtp });

      await client.query("COMMIT");
      return NextResponse.json({ message: "OTP sent successfully." }, { status: 200 });
    }

    if (action === "verify_otp") {
      if (!email || !otp) {
        return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
      }

      const verification = verifyEmailOtp(email, otp);
      
      if (!verification.success) {
        return NextResponse.json({ error: verification.message }, { status: 400 });
      }

      await client.query("COMMIT");
      return NextResponse.json({ message: "Identity verified successfully." }, { status: 200 });
    }

    if (action === "reset") {
      if (!username) {
        return NextResponse.json({ error: "Username is required." }, { status: 400 });
      }

      if (!newPassword) {
        return NextResponse.json({ error: "New password is required." }, { status: 400 });
      }

      const hashedPassword = await hashPassword(newPassword);

      await client.query(
        `UPDATE banka."User" 
        SET password = $1 
        WHERE LOWER(username) = LOWER($2)`,
        [hashedPassword, username]
      );

      await client.query("COMMIT");
      return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error("Password reset error:", error);
    
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}