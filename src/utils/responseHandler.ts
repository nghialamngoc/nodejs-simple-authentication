// src/utils/responseHandler.ts
import { Response } from "express";

export class ResponseHandler {
  static success(
    res: Response,
    data: any = null,
    message: string = "Success",
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string = "Error occurred",
    statusCode: number = 500,
    errors: any = null
  ): void {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}
