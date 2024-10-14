"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptPassword = encryptPassword;
exports.verifyPassword = verifyPassword;
const crypto_js_1 = __importDefault(require("crypto-js"));
// Đảm bảo SERVER_SECRET_KEY được lưu trữ an toàn, tốt nhất là trong biến môi trường
const SERVER_SECRET_KEY = process.env.SECRET_KEY || "default-server-secret-key";
function encryptPassword(clientHashedPassword) {
    if (!SERVER_SECRET_KEY) {
        console.log("Error: not config SERVER_SECRET_KEY");
        return "";
    }
    return crypto_js_1.default.HmacSHA256(clientHashedPassword, SERVER_SECRET_KEY).toString();
}
function verifyPassword(inputPassword, storedPassword) {
    const hashedInput = encryptPassword(inputPassword);
    return hashedInput === storedPassword;
}
