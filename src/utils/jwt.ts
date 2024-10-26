import jwt, { JwtPayload } from "jsonwebtoken";

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
}
