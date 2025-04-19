import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Register route
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
  ],
  AuthController.register
);

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  AuthController.login
);

// Refresh token route
router.post(
  "/refresh-token",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  AuthController.refreshToken
);

// Logout route
router.post("/logout", AuthController.logout);

router.post(
  "/google-login",
  [body("idToken").notEmpty().withMessage("ID token is required")],
  AuthController.googleLogin
);

router.get("/user", [AuthMiddleware.authenticate], AuthController.getUser);

export const authRoutes = router;
