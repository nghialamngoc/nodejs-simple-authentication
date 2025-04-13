import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";
import { ResponseHandler } from "../utils/responseHandler";
import { ITokenPayload } from "../types";

export class AuthMiddleware {
  static authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ResponseHandler.error(res, "Access denied. No token provided", 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        jwtConfig.accessSecret
      ) as ITokenPayload;
      req.user = {
        userId: decoded.userId,
        roles: decoded.roles,
      };
      next();
    } catch (error) {
      ResponseHandler.error(res, "Invalid or expired token", 401);
    }
  }
}
