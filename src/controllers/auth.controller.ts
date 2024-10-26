import { GoogleAuthService, GoogleUser } from "../services/googleAuth.service";
import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AuthRequest, AuthResponse } from "../types/auth.type";
import { encryptPassword, verifyPassword } from "../utils/password";
import { ms } from "../utils/time";

export class AuthController {
  private googleAuthService: GoogleAuthService;
  private userService: UserService;

  constructor() {
    this.googleAuthService = new GoogleAuthService();
    this.userService = new UserService();
  }

  register = async (req: AuthRequest, res: AuthResponse): Promise<void> => {
    try {
      const { email, password: clientHashPassword } = req.body;

      // Kiểm tra tính hợp lệ của email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Email không đúng format." });
        return;
      }

      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await this.userService.findUser({ email });
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
      const newUser = await this.userService.createUser({
        email,
        password,
      });

      // Trả về response thành công
      res.status(201).json({
        message: "Đăng kí thành công.",
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
          userName: newUser.userName,
          avatar: newUser.avatar,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Có lỗi xảy ra vui lòng thử lại." });
    }
  };

  private handleGoogleLogin = async (token: string) => {
    // 1. Verify Google token và lấy thông tin user
    const googleUser: GoogleUser =
      await this.googleAuthService.verifyGoogleToken(token);

    // 2. Tìm user trong database
    let user = await this.userService.findUser({ email: googleUser.email });

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = await this.userService.createUser({
        email: googleUser.email,
        userName: googleUser.name,
        avatar: googleUser.picture,
        provider: "google",
        providerId: googleUser.sub,
        isVerified: true,
      });
    } else if (user.provider !== "google") {
      throw new Error("Email already exists with different login method");
    }
    return user;
  };

  private handleEmailLogin = async (email: string, password: string) => {
    // Tìm user trong database
    const user = await this.userService.findUser({ email });

    if (!user) {
      throw new Error("Email hoặc password không đúng.");
    }

    // Kiểm tra password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      throw new Error("Email hoặc password không đúng.");
    }

    return user;
  };

  login = async (req: AuthRequest, res: AuthResponse): Promise<void> => {
    try {
      const { type, token, email, password } = req.body;
      let user;

      switch (type) {
        case "google":
          user = await this.handleGoogleLogin(token);
          break;

        case "email":
          user = await this.handleEmailLogin(email, password);
          break;

        default:
          res.status(400).json({ message: "Invalid login type" });
          return;
      }

      // Tạo tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Lưu refreshToken vào database
      user.refreshToken = refreshToken;
      await user.save();

      // set refreshToken to cookie
      res.cookie(process.env.RFTK_KEY ?? "", refreshToken, {
        maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY ?? "7d"),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      // Gửi tokens về client
      res.status(200).json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);

      res.status(401).json({ message: error.message });
      return;
    }
  };

  logout = async (req: AuthRequest, res: AuthResponse): Promise<void> => {
    try {
      const refreshToken = req.cookies[process.env.RFTK_KEY ?? ""];
      if (refreshToken) {
        // Verify the refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Find the user with this refresh token
        const user = await this.userService.findUser({
          _id: payload.userId,
          refreshToken: refreshToken,
        });

        if (user) {
          user.refreshToken = "";
          await user.save();
        }

        res.clearCookie(process.env.RFTK_KEY ?? "");
      }

      // Gửi tokens về client
      res.status(200).json({
        message: "logout success",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  refreshToken = async (req: AuthRequest, res: AuthResponse): Promise<void> => {
    const refreshToken = req.cookies[process.env.RFTK_KEY ?? ""];

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh Token đã hết hạn." });
      return;
    }

    try {
      // Verify the refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Find the user with this refresh token
      const user = await this.userService.findUser({
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
  };
}
