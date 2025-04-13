import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/responseHandler";

export class RBACMiddleware {
  static hasRole(requiredRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        ResponseHandler.error(res, "Unauthorized", 401);
        return;
      }

      const hasRequiredRole = requiredRoles.some((role) =>
        req.user!.roles.includes(role)
      );

      if (!hasRequiredRole) {
        ResponseHandler.error(res, "Forbidden: Insufficient privileges", 403);
        return;
      }

      next();
    };
  }

  // For more complex permission-based control
  static hasPermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        ResponseHandler.error(res, "Unauthorized", 401);
        return;
      }

      // This would need to be expanded with a real permission system
      // that maps roles to permissions
      const isAdmin = req.user.roles.includes("admin");

      if (!isAdmin) {
        ResponseHandler.error(res, "Forbidden: Insufficient privileges", 403);
        return;
      }

      next();
    };
  }
}
