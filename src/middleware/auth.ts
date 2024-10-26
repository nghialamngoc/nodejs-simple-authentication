import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import {
  AuthRequest,
  AuthResponse,
  MiddlewareAuthRequest,
} from "../types/auth.type";

export function authenticateToken(
  req: MiddlewareAuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.sendStatus(403);
    return;
  }
}

// middlewares/validateLoginRequest.ts
export const validateLoginRequest = (
  req: AuthRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  const { type } = req.body;

  if (!type) {
    res.status(400).json({ message: "Login type is required" });
    return;
  }

  switch (type) {
    case "google":
      if (!req.body.token) {
        res.status(400).json({ message: "Google token is required" });
        return;
      }
      break;

    case "email":
      if (!req.body.email || !req.body.password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }
      break;

    default:
      res.status(400).json({ message: "Invalid login type" });
      return;
  }

  next();
};
