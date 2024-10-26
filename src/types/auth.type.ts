import { Request, Response } from "express";

export interface AuthRequest extends Request {
  body: {
    type: "email" | "google";
    email: string;
    password: string;
    token: string;
  };
}

export interface MiddlewareAuthRequest extends Request {
  user?: { userId: string };
}

export interface AuthResponse extends Response {
  message?: string;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
}
