import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Token } from "../models/token.model";
import {
  ILoginInput,
  ITokenPayload,
  IAuthResponse,
  IRefreshTokenInput,
  IRegisterInput,
} from "../types";
import { jwtConfig } from "../config/jwt";
import { ms } from "../utils/time";
import * as bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { config } from "../config";
import axios from "axios";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

const googleClient = new OAuth2Client(config.googleClientId);

export class AuthService {
  static async register(
    registerInput: IRegisterInput
  ): Promise<IAuthResponse | null> {
    const { email, password, name } = registerInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return null;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo người dùng mới
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      roles: ["user"],
      isActive: true,
      twoFactorEnabled: false,
    });

    const tokens = await this.generateTokens(user._id.toString(), user.roles);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  static async login(loginInput: ILoginInput): Promise<IAuthResponse | null> {
    const { email, password } = loginInput;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) return null;

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return null;

    // Kiểm tra 2FA
    if (user.twoFactorEnabled) {
      // Nếu 2FA đã bật, yêu cầu mã OTP
      return {
        requires2FA: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      };
    }

    // Nếu 2FA chưa bật, tạo bí mật TOTP và mã QR
    const secret = speakeasy.generateSecret({
      name: `BeuBeoAccessory:${email}`,
      issuer: "BeuBeoAccessory",
    });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      requires2FA: true,
      qrCodeUrl,
      tempSecret: secret.base32,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  static async enable2FA(
    email: string,
    otp: string,
    tempSecret: string
  ): Promise<IAuthResponse | null> {
    try {
      // Xác minh mã OTP
      const isValid = speakeasy.totp.verify({
        secret: tempSecret,
        encoding: "base32",
        token: otp,
        window: 1, // Cho phép sai lệch thời gian
      });

      if (!isValid) {
        return null; // OTP không hợp lệ
      }

      // Tìm người dùng
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return null; // Không tìm thấy người dùng
      }

      // Tạo mã khôi phục
      const recoveryCodes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      // Cập nhật 2FA
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            twoFactorEnabled: true,
            twoFactorSecret: tempSecret,
            recoveryCodes,
          },
        }
      );

      // Tạo token
      const tokens = await this.generateTokens(user._id.toString(), user.roles);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
        recoveryCodes, // Trả về mã khôi phục
      };
    } catch (error) {
      console.error("Enable 2FA error:", error);
      return null;
    }
  }

  // Xác minh mã OTP
  static async verify2FA(
    email: string,
    otp: string
  ): Promise<IAuthResponse | null> {
    try {
      // Tìm người dùng
      const user = await User.findOne({ email, isActive: true });
      if (!user || !user.twoFactorEnabled) {
        return null; // 2FA không bật hoặc không tìm thấy người dùng
      }

      // Xác minh mã OTP
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: "base32",
        token: otp,
        window: 1,
      });

      if (!isValid) {
        return null; // OTP không hợp lệ
      }

      // Tạo token
      const tokens = await this.generateTokens(user._id.toString(), user.roles);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      };
    } catch (error) {
      console.error("Verify 2FA error:", error);
      return null;
    }
  }

  static async googleLogin(accessToken: string): Promise<IAuthResponse | null> {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("response", response);

      const { sub: providerId, email, name } = response.data;

      if (!email) {
        throw new Error("Email not provided by Google");
      }

      let user = await User.findOne({
        providerId: providerId,
        provider: "google",
      });

      if (!user) {
        user = await User.findOne({ email });

        if (user) {
          user.providerId = providerId;
          await user.save();
        } else {
          user = await User.create({
            providerId,
            provider: "google",
            email,
            name: name || "Google User",
            roles: ["user"],
            isActive: true,
            twoFactorEnabled: false,
          });
        }
      }

      const tokens = await this.generateTokens(user._id.toString(), user.roles);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      };
    } catch (error: any) {
      console.log("googleLogin error:", error.message);
      return null;
    }
  }

  static async facebookLogin(accessToken: string) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
      );

      const { id, name, email } = response.data;

      if (!email) {
        throw new Error("Email not provided by Facebook");
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          name: name || `Facebook User ${id}`,
          password: "",
          provider: "facebook",
          roles: ["user"],
          providerId: id,
          isActive: true,
          twoFactorEnabled: false,
        });
      }

      const tokens = await this.generateTokens(user._id.toString(), user.roles);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      };
    } catch (error) {
      console.error("Facebook login error:", error);
      return null;
    }
  }

  static async refreshToken(
    refreshTokenInput: IRefreshTokenInput
  ): Promise<{ accessToken: string } | null> {
    const { refreshToken } = refreshTokenInput;

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        jwtConfig.refreshSecret
      ) as ITokenPayload;

      // Check if token exists and is not revoked
      const tokenDoc = await Token.findOne({
        token: refreshToken,
        userId: decoded.userId,
        type: "refresh",
        isRevoked: false,
      });

      if (!tokenDoc) return null;

      // Generate new access token
      const accessToken = this.generateAccessToken(
        decoded.userId,
        decoded.roles
      );

      return { accessToken };
    } catch (error) {
      return null;
    }
  }

  static async logout(refreshToken: string): Promise<boolean> {
    try {
      // Revoke refresh token
      const result = await Token.findOneAndUpdate(
        { token: refreshToken, isRevoked: false },
        { isRevoked: true }
      );

      return !!result;
    } catch (error) {
      return false;
    }
  }

  static async generateTokens(
    userId: string,
    roles: string[]
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(userId, roles);
    const refreshToken = this.generateRefreshToken(userId, roles);

    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + ms(jwtConfig.accessExpiresIn));

    await Token.create({
      userId,
      token: refreshToken,
      type: "refresh",
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private static generateAccessToken(userId: string, roles: string[]): string {
    const payload: ITokenPayload = { userId, roles };
    return jwt.sign(payload, jwtConfig.accessSecret, {
      expiresIn: ms(jwtConfig.accessExpiresIn),
    });
  }

  private static generateRefreshToken(userId: string, roles: string[]): string {
    const payload: ITokenPayload = { userId, roles };
    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: ms(jwtConfig.refreshExpiresIn),
    });
  }
}
