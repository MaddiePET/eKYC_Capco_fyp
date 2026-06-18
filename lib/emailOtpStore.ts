type EmailOtpRecord = {
  otp: string;
  expiresAt: number;
};

declare global {
  var emailOtpStore: Map<string, EmailOtpRecord> | undefined;
}

const emailOtpStore = global.emailOtpStore ?? new Map<string, EmailOtpRecord>();

global.emailOtpStore = emailOtpStore;

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export function saveEmailOtp(email: string, otp: string) {
  emailOtpStore.set(normalizeEmail(email), {
    otp: otp.trim(),
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
}

export function verifyEmailOtp(email: string, otp: string) {
  const normalized = normalizeEmail(email);
  const record = emailOtpStore.get(normalized);

  if (!record) {
    return {
      success: false,
      message: "OTP not found. Please request a new code.",
    };
  }

  if (Date.now() > record.expiresAt) {
    emailOtpStore.delete(normalized);
    return {
      success: false,
      message: "OTP expired. Please request a new code.",
    };
  }

  if (record.otp !== otp.trim()) {
    return {
      success: false,
      message: "Invalid OTP code.",
    };
  }

  emailOtpStore.delete(normalized);

  return {
    success: true,
    message: "Email verified successfully.",
  };
}