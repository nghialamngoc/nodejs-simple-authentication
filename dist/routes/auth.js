"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const password_1 = require("../utils/password");
const multer_1 = __importDefault(require("multer"));
const jwt_1 = require("../utils/jwt");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post("/register", upload.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password: clientHashPassword } = req.body;
        // Kiểm tra tính hợp lệ của email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: "Email không đúng format." });
            return;
        }
        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Email đã tồn tại." });
            return;
        }
        // Encrypt password ở phía server
        const password = (0, password_1.encryptPassword)(clientHashPassword);
        if (!password) {
            res
                .status(400)
                .json({ message: "Có lỗi xảy ra vui lòng thử lại sau." });
            return;
        }
        // Tạo user mới với password đã được hash
        const newUser = new User_1.default({
            email,
            password, // Password đã được hash từ client
            role: "user", // Nếu không cung cấp role, mặc định là 'user'
        });
        // Lưu user vào database
        yield newUser.save();
        // Trả về response thành công
        res.status(201).json({
            message: "Đăng kí thành công.",
            user: {
                id: newUser._id.toString(),
                email: newUser.email,
                role: newUser.role,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Có lỗi xảy ra vui lòng thử lại." });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password: clientHashPassword } = req.body;
        // Tìm user trong database
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Email hoặc password không đúng." });
            return;
        }
        // Kiểm tra password
        const isValidPassword = yield (0, password_1.verifyPassword)(clientHashPassword, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: "Email hoặc password không đúng." });
            return;
        }
        // Tạo tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user._id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id);
        // Lưu refreshToken vào database
        user.refreshToken = refreshToken;
        yield user.save();
        // Gửi tokens về client
        res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post("/refresh-token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: "Refresh Token is required" });
        return;
    }
    try {
        // Verify the refresh token
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        // Find the user with this refresh token
        const user = yield User_1.default.findOne({
            _id: payload.userId,
            refreshToken: refreshToken,
        });
        if (!user) {
            res.status(403).json({ message: "Invalid refresh token" });
            return;
        }
        // Generate a new access token
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        // Send the new access token
        res.json({ accessToken });
    }
    catch (error) {
        console.error("Refresh token error:", error);
        res.status(403).json({ message: "Invalid refresh token" });
    }
}));
exports.default = router;
