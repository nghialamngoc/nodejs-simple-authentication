import CryptoJS from "crypto-js";

// Đảm bảo SERVER_SECRET_KEY được lưu trữ an toàn, tốt nhất là trong biến môi trường
const SERVER_SECRET_KEY = process.env.SECRET_KEY || "default-server-secret-key";

export function encryptPassword(clientHashedPassword: string): string {
  console.log("SERVER_SECRET_KEY: ", SERVER_SECRET_KEY);

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
