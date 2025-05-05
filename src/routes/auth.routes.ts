import { Router } from "express";
import { body, cookie } from "express-validator";
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

// Kích hoạt 2FA
router.post(
  "/enable-2fa",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("otp").isString().withMessage("Please provide a valid otp"),
    body("tempSecret")
      .isString()
      .withMessage("Please provide a valid tempSecret"),
  ],
  AuthController.enable2FA
);

// Xác minh 2FA
router.post(
  "/verify-2fa",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("otp").isString().withMessage("Please provide a valid otp"),
  ],
  AuthController.verify2FA
);

// Refresh token route
router.post(
  "/refresh-token",
  [cookie("refreshToken").notEmpty().withMessage("Refresh token is required")],
  AuthController.refreshToken
);

// Logout route
router.post("/logout", AuthController.logout);

router.post(
  "/google-login",
  [body("accessToken").notEmpty().withMessage("Access token is required")],
  AuthController.googleLogin
);

router.post(
  "/facebook-login",
  [body("accessToken").notEmpty().withMessage("Access token is required")],
  AuthController.facebookLogin
);

router.get("/user", [AuthMiddleware.authenticate], AuthController.getUser);

export const authRoutes = router;
