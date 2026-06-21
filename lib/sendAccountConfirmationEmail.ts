import nodemailer from "nodemailer";

type ConfirmationEmailParams = {
  to: string;
  fullName: string;
  accountType: string;
  accountNo: string;
};

export async function sendAccountConfirmationEmail({
  to,
  fullName,
  accountType,
  accountNo,
}: ConfirmationEmailParams) {
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
    subject: `Bank A ${accountType} Approval Confirmation`,
    text: `
Hi ${fullName},

Your ${accountType} application has been approved successfully.

Account Number: ${accountNo}

Thank you for applying with Bank A.
    `.trim(),
    html: `
    <div style="margin:0; padding:0; background-color:#f5f7fb; font-family:Arial, Helvetica, sans-serif;">
      <div style="max-width:560px; margin:0 auto; padding:40px 16px;">
        <div style="background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #d9dce8;">
          <div style="background-color:#2c2f42; padding:30px 32px; text-align:center;">
            <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:800; letter-spacing:0.4px;">
              DTCOB Banking Services
            </h1>
            <p style="margin:8px 0 0; color:#c7d2fe; font-size:13px; font-weight:600; letter-spacing:0.4px;">
              Account Application Confirmation
            </p>
          </div>
          <div style="padding:36px 32px 32px;">
            <p style="margin:0 0 12px; color:#2c2f42; font-size:22px; font-weight:800; text-align:center; letter-spacing:0.2px;">
              Your Account Application Has Been Approved
            </p>
            <p style="margin:0 auto 24px; max-width:420px; color:#374151; font-size:14px; line-height:1.7; text-align:center;">
              Hi <strong>${fullName}</strong>, your <strong>${accountType}</strong> application has been approved successfully.
            </p>
            <div style="text-align:center; margin:30px 0;">
              <div style="display:inline-block; background-color:#eef2ff; border:2px solid #3D405B; color:#2c2f42; padding:20px 30px; border-radius:14px;">
                <p style="margin:0 0 8px; color:#4b5563; font-size:13px; font-weight:700; letter-spacing:0.4px;">
                  ACCOUNT NUMBER
                </p>
                <p style="margin:0; color:#2c2f42; font-size:28px; font-weight:800; letter-spacing:4px;">
                  ${accountNo}
                </p>
              </div>
            </div>
            <p style="margin:0 0 8px; color:#2c2f42; font-size:14px; line-height:1.6; text-align:center;">
              Your account has been created and approved in our system.
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