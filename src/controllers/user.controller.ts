// src/controllers/user.controller.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { UserService } from "../services/user.service";
import { ResponseHandler } from "../utils/responseHandler";
import { logger } from "../utils/logger";

export class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseHandler.error(res, "Validation Error", 400, errors.array());
        return;
      }

      const user = await UserService.createUser(req.body);
      ResponseHandler.success(res, user, "User created successfully", 201);
    } catch (error: any) {
      logger.error("Create user error:", error);

      if (error.code === 11000) {
        ResponseHandler.error(res, "Email already exists", 400);
        return;
      }

      ResponseHandler.error(res, "Failed to create user");
    }
  }

  static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await UserService.getUserById(userId);

      if (!user) {
        ResponseHandler.error(res, "User not found", 404);
        return;
      }

      ResponseHandler.success(res, user, "User retrieved successfully");
    } catch (error) {
      logger.error("Get user error:", error);
      ResponseHandler.error(res, "Failed to get user");
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseHandler.error(res, "Validation Error", 400, errors.array());
        return;
      }

      const userId = req.params.id;
      const updatedUser = await UserService.updateUser(userId, req.body);

      if (!updatedUser) {
        ResponseHandler.error(res, "User not found", 404);
        return;
      }

      ResponseHandler.success(res, updatedUser, "User updated successfully");
    } catch (error) {
      logger.error("Update user error:", error);
      ResponseHandler.error(res, "Failed to update user");
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const result = await UserService.deleteUser(userId);

      if (!result) {
        ResponseHandler.error(res, "User not found", 404);
        return;
      }

      ResponseHandler.success(res, null, "User deleted successfully");
    } catch (error) {
      logger.error("Delete user error:", error);
      ResponseHandler.error(res, "Failed to delete user");
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      ResponseHandler.success(res, users, "Users retrieved successfully");
    } catch (error) {
      logger.error("Get all users error:", error);
      ResponseHandler.error(res, "Failed to get users");
    }
  }
}
