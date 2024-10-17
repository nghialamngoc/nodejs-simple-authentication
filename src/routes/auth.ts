import express, { Request, Response } from "express";
import User from "../models/User";
import { encryptPassword, verifyPassword } from "../utils/password";
import multer from "multer";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { ms } from "../utils/time";

const router = express.Router();
const upload = multer();

interface AuthRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RegisterResponse {
  message: string;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
}

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

router.post(
  "/register",
  upload.none(),
  async (
    req: AuthRequest,
    res: Response<RegisterResponse | { message: string }>
  ): Promise<void> => {
    try {
      const { email, password: clientHashPassword } = req.body;

      // Kiểm tra tính hợp lệ của email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Email không đúng format." });
        return;
      }

      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "Email đã tồn tại." });
        return;
      }

      // Encrypt password ở phía server
      const password = encryptPassword(clientHashPassword);

      if (!password) {
        res
          .status(400)
          .json({ message: "Có lỗi xảy ra vui lòng thử lại sau." });
        return;
      }

      // Tạo user mới với password đã được hash
      const newUser = new User({
        email,
        password, // Password đã được hash từ client
        role: "user", // Nếu không cung cấp role, mặc định là 'user'
      });

      // Lưu user vào database
      await newUser.save();

      // Trả về response thành công
      res.status(201).json({
        message: "Đăng kí thành công.",
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Có lỗi xảy ra vui lòng thử lại." });
    }
  }
);

router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password: clientHashPassword } = req.body;

    // Tìm user trong database
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Email hoặc password không đúng." });
      return;
    }

    // Kiểm tra password
    const isValidPassword = await verifyPassword(
      clientHashPassword,
      user.password
    );

    if (!isValidPassword) {
      res.status(401).json({ message: "Email hoặc password không đúng." });
      return;
    }

    // Tạo tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Lưu refreshToken vào database
    user.refreshToken = refreshToken;
    await user.save();

    // set refreshToken to cookie
    res.cookie("blog_rf_tk", refreshToken, {
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY ?? "7d"),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "*",
    });

    // Gửi tokens về client
    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/refresh-token",
  async (req: RefreshTokenRequest, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh Token đã hết hạn." });
      return;
    }

    try {
      // Verify the refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Find the user with this refresh token
      const user = await User.findOne({
        _id: payload.userId,
        refreshToken: refreshToken,
      });

      if (!user) {
        res.status(403).json({ message: "Refresh Token không hợp lệ." });
        return;
      }

      // Generate a new access token
      const accessToken = generateAccessToken(user._id.toString());

      // Send the new access token
      res.json({ accessToken });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(403).json({ message: "Refresh Token không hợp lệ." });
    }
  }
);

export default router;
