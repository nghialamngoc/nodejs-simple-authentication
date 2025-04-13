import { Router } from "express";
import { body, param } from "express-validator";
import { UserController } from "../controllers/user.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RBACMiddleware } from "../middlewares/rbac.middleware";
import { ResponseHandler } from "../utils/responseHandler";
import { Request, Response, NextFunction } from "express";

const router = Router();

// Create user - Only admins can create users
router.post(
  "/create",
  [
    AuthMiddleware.authenticate,
    RBACMiddleware.hasRole(["admin"]),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("name").notEmpty().withMessage("Name is required"),
    body("roles").optional().isArray().withMessage("Roles must be an array"),
  ],
  UserController.createUser
);

// Get user by ID - User can view their own profile, admins can view any profile
router.get(
  "/:id",
  [
    AuthMiddleware.authenticate,
    param("id").isMongoId().withMessage("Invalid user ID"),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const authReq = req;
    // Allow access to own profile or admin access to any profile
    if (
      authReq.user &&
      (authReq.user.userId === req.params.id ||
        authReq.user.roles.includes("admin"))
    ) {
      next();
    } else {
      ResponseHandler.error(res, "Forbidden: Access denied", 403);
    }
  },
  UserController.getUser
);

// Update user - User can update their own profile, admins can update any profile
router.put(
  "/:id",
  [
    AuthMiddleware.authenticate,
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("name").optional().notEmpty().withMessage("Name is required"),
    body("roles").optional().isArray().withMessage("Roles must be an array"),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const authReq = req;
    // Allow update to own profile or admin access to any profile
    if (
      authReq.user &&
      (authReq.user.userId === req.params.id ||
        authReq.user.roles.includes("admin"))
    ) {
      // Only admins can update roles
      if (req.body.roles && !authReq.user.roles.includes("admin")) {
        delete req.body.roles;
      }
      next();
    } else {
      ResponseHandler.error(res, "Forbidden: Access denied", 403);
    }
  },
  UserController.updateUser
);

// Delete user - Only admins can delete users
router.delete(
  "/:id",
  [
    AuthMiddleware.authenticate,
    RBACMiddleware.hasRole(["admin"]),
    param("id").isMongoId().withMessage("Invalid user ID"),
  ],
  UserController.deleteUser
);

// Get all users - Only admins can list all users
router.get(
  "/",
  [AuthMiddleware.authenticate, RBACMiddleware.hasRole(["admin"])],
  UserController.getAllUsers
);

export const userRoutes = router;
