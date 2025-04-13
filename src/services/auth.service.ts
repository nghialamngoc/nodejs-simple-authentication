import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Token } from "../models/token.model";
import {
  ILoginInput,
  ITokenPayload,
  IAuthResponse,
  IRefreshTokenInput,
  IUser,
} from "../types";
import { jwtConfig } from "../config/jwt";
import { ms } from "../utils/time";

export class AuthService {
  static async login(loginInput: ILoginInput): Promise<IAuthResponse | null> {
    const { email, password } = loginInput;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) return null;

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return null;

    // Generate tokens
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

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

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
