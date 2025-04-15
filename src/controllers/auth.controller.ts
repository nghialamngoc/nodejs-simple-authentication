import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthService } from "../services/auth.service";
import { ResponseHandler } from "../utils/responseHandler";
import { logger } from "../utils/logger";
import { ms } from "../utils/time";
import { jwtConfig } from "../config/jwt";

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Ngăn JavaScript truy cập cookie
    secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS trong production
    sameSite: "strict", // Ngăn gửi cookie trong các request cross-site
    maxAge: ms(jwtConfig.accessExpiresIn), // Hết hạn sau 7 ngày
  });
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.error(
          res,
          "Validation Error",
          400,
          errors.array()
        );
      }

      const registerResult = await AuthService.register(req.body);

      if (!registerResult) {
        return ResponseHandler.error(res, "Email already exists", 401);
      }

      return ResponseHandler.success(
        res,
        registerResult,
        "Register successful"
      );
    } catch (error) {
      logger.error("Register error:", error);
      return ResponseHandler.error(res, "Register failed");
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.error(
          res,
          "Validation Error",
          400,
          errors.array()
        );
      }

      const loginResult = await AuthService.login(req.body);

      if (!loginResult) {
        return ResponseHandler.error(res, "Invalid credentials", 401);
      }

      setRefreshTokenCookie(res, loginResult.refreshToken);

      const { refreshToken, ...responseData } = loginResult;

      return ResponseHandler.success(res, responseData, "Login successful");
    } catch (error) {
      logger.error("Login error:", error);
      return ResponseHandler.error(res, "Login failed");
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.error(
          res,
          "Validation Error",
          400,
          errors.array()
        );
      }

      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return ResponseHandler.error(res, "Refresh token not provided", 401);
      }

      const result = await AuthService.refreshToken({
        refreshToken,
      });

      if (!result) {
        return ResponseHandler.error(
          res,
          "Invalid or expired refresh token",
          401
        );
      }

      return ResponseHandler.success(
        res,
        result,
        "Token refreshed successfully"
      );
    } catch (error) {
      logger.error("Refresh token error:", error);
      return ResponseHandler.error(res, "Failed to refresh token");
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        const result = await AuthService.logout(refreshToken);

        if (!result) {
          return ResponseHandler.error(res, "Logout failed", 400);
        }
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return ResponseHandler.success(res, null, "Logged out successfully");
    } catch (error) {
      logger.error("Logout error:", error);
      return ResponseHandler.error(res, "Logout failed");
    }
  }

  static async googleLogin(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.error(
        res,
        "Validation Error",
        400,
        errors.array()
      );
    }

    const { idToken } = req.body;

    try {
      const result = await AuthService.googleLogin(idToken);
      if (!result) {
        return ResponseHandler.error(res, "Invalid Google ID token", 401);
      }

      setRefreshTokenCookie(res, result.refreshToken);

      // Loại bỏ refreshToken khỏi response body
      const { refreshToken, ...responseData } = result;

      return ResponseHandler.success(res, responseData);
    } catch (error) {
      return ResponseHandler.error(res, "Failed to login with Google", 500);
    }
  }
}
