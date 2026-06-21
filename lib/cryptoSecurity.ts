import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

type CryptoSource = "jpn" | "jim" | "ssm" | "banka";

function getKey(source: CryptoSource) {
  const keyMap: Record<CryptoSource, string | undefined> = {
    jpn: process.env.JPN_ENCRYPTION_KEY,
    jim: process.env.JIM_ENCRYPTION_KEY,
    ssm: process.env.SSM_ENCRYPTION_KEY,
    banka: process.env.BANKA_ENCRYPTION_KEY,
  };

  const keyHex = keyMap[source];

  if (!keyHex) {
    throw new Error(`Missing encryption key for ${source}`);
  }

  return Buffer.from(keyHex, "hex");
}

function encrypt(value: string | null | undefined, source: CryptoSource) {
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

function decrypt(payload: string | null | undefined, source: CryptoSource) {
  if (!payload) return "";

  const parts = payload.split(":");

  if (parts.length !== 3) {
    console.error("[CRYPTO ERROR] Invalid payload format:", payload);
    return "";
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getKey(source),
      Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("[CRYPTO ERROR] Failed decrypt:", {
      payload,
      source,
      error: error instanceof Error ? error.message : String(error),
    });
    return "[DECRYPT_FAILED]";
  }
}

function hashLookup(value: string | null | undefined) {
  if (!value) return "";

  return crypto
    .createHash("sha256")
    .update(value.replace(/-/g, "").trim())
    .digest("hex");
}

export { encrypt, decrypt, hashLookup };