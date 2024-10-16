import CryptoJS from "crypto-js";

export function encryptPassword(clientHashedPassword: string): string {
  const SERVER_SECRET_KEY =
    process.env.SECRET_KEY || "default-server-secret-key";

  return CryptoJS.HmacSHA256(
    clientHashedPassword,
    SERVER_SECRET_KEY
  ).toString();
}

export function verifyPassword(
  inputPassword: string,
  storedPassword: string
): boolean {
  const hashedInput = encryptPassword(inputPassword);
  return hashedInput === storedPassword;
}
