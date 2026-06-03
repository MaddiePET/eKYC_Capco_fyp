import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { username, email, message } = await req.json();

    if (!username?.trim() || !email?.trim() || !message?.trim()) {
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
      from: `"DTCOB Contact Form" <${process.env.EMAIL_USER}>`,
      to: "dtcobank@gmail.com",
      replyTo: email,
      subject: `New contact message from ${username}`,
      text: `New contact form submission:\n\nName: ${username}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
          <h2 style="margin-bottom:16px;">New contact form submission</h2>
          <p><strong>Name:</strong> ${username}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <div style="margin-top:24px; padding:18px; background:#f9fafb; border-radius:12px; border:1px solid #e5e7eb;">
            <p style="margin:0; white-space:pre-wrap;">${message}</p>
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
