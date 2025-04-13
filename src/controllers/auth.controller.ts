import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthService } from "../services/auth.service";
import { ResponseHandler } from "../utils/responseHandler";
import { logger } from "../utils/logger";

export class AuthController {
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

      return ResponseHandler.success(res, loginResult, "Login successful");
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

      const result = await AuthService.refreshToken({
        refreshToken: req.body.refreshToken,
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
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseHandler.error(res, "Refresh token is required", 400);
      }

      const result = await AuthService.logout(refreshToken);

      if (!result) {
        return ResponseHandler.error(res, "Logout failed", 400);
      }

      return ResponseHandler.success(res, null, "Logged out successfully");
    } catch (error) {
      logger.error("Logout error:", error);
      return ResponseHandler.error(res, "Logout failed");
    }
  }
}
