import express from "express";
import multer from "multer";

import { AuthController } from "../controllers/auth.controller";
import { validateLoginRequest } from "../middleware/auth";

const router = express.Router();
const upload = multer();

const authController = new AuthController();

router.post("/register", upload.none(), authController.register);

router.post("/login", validateLoginRequest, authController.login);

router.get("/logout", authController.logout);

router.post("/refresh-token", authController.refreshToken);

export default router;
