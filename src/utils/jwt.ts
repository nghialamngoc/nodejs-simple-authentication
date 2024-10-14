import jwt, { JwtPayload } from "jsonwebtoken";
import { ms } from "./time";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "df_token_sr";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "df_token_sr";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_SECRET || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_SECRET || "7d";

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ms(ACCESS_TOKEN_EXPIRY),
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: ms(REFRESH_TOKEN_EXPIRY),
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
}
