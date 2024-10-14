"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./database"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const auth_2 = require("./middleware/auth");
// Xác định môi trường
const environment = process.env.NODE_ENV || "development";
// Load file .env tương ứng
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, `../.env.${environment}`),
});
console.log(`Current environment: ${environment}`);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
(0, database_1.default)();
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.get("/", (req, res) => {
    res.send(`Hello, TypeScript with MongoDB! Environment 1: ${environment}`);
});
app.get("/protected", auth_2.authenticateToken, (req, res) => {
    var _a;
    res.json({ message: "This is a protected route", userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${environment} mode`);
});
