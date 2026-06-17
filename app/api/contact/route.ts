import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, message } = await req.json();

    if (!email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"DTCOB Contact Support" <${process.env.EMAIL_USER}>`,
      to: "dtcobank@gmail.com",
      replyTo: email,
      subject: `New Support Message / Complaint from ${email}`,
      html: `
      <div style="margin:0; padding:0; background-color:#f5f7fb; font-family:Arial, Helvetica, sans-serif;">
        <div style="max-width:560px; margin:0 auto; padding:40px 16px;">
          <div style="background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #d9dce8;">
            <div style="background-color:#2c2f42; padding:30px 32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:800; letter-spacing:0.4px;">
                DTCOB Banking Services
              </h1>
              <p style="margin:8px 0 0; color:#c7d2fe; font-size:13px; font-weight:600; letter-spacing:0.4px;">
                Contact Support
              </p>
            </div>
            <div style="padding:36px 32px 32px;">
              <p style="margin:0 0 12px; color:#2c2f42; font-size:22px; font-weight:800; text-align:center; letter-spacing:0.2px;">
                New Message Received
              </p>
              <p style="margin:0 auto 28px; max-width:420px; color:#374151; font-size:14px; line-height:1.7; text-align:center;">
                You have received a new support message or complaint from <a href="mailto:${email}" style="color:#3b82f6; text-decoration:none;">${email}</a>.
              </p>
              <div style="text-align:center; margin:30px 0;">
                <div style="display:inline-block; background-color:#eef2ff; border:2px solid #3D405B; color:#2c2f42; padding:20px 30px; border-radius:14px; text-align:left; min-width:260px;">
                  <p style="margin:0 0 12px; color:#4b5563; font-size:13px; font-weight:700; letter-spacing:0.4px;">
                    SENDER INFORMATION
                  </p> 
                  <p style="margin:0; color:#2c2f42; font-size:15px; font-weight:800;">
                    Email: <a href="mailto:${email}" style="color:#3b82f6; text-decoration:none; font-weight:normal;">${email}</a>
                  </p>
                </div>
              </div>
              <div style="margin-top:28px;">
                <p style="margin:0 0 8px; color:#2c2f42; font-size:14px; font-weight:700; letter-spacing:0.4px;">
                  Message / Complaint Content:
                </p>
                <div style="padding:20px; background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; color:#374151; font-size:14px; line-height:1.6; white-space:pre-wrap;">${message}</div>
              </div>
            </div>
            <div style="padding:18px 32px; background-color:#f1f2f6; border-top:1px solid #d9dce8; text-align:center;">
              <p style="margin:0; color:#6b7280; font-size:12px; line-height:1.5;">
                This is an automated notification from DTCOB Banking Services.
              </p>
            </div>
          </div>
        </div>
      </div>
      `,
    });

    return NextResponse.json({
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact form email failed:", error);
    return NextResponse.json(
      { error: "Failed to send your message. Please try again later." },
      { status: 500 }
    );
  }
}