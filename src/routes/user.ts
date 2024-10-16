import { authenticateToken } from "../middleware/auth";
import User from "../models/User";
import express, { Request, Response } from "express";

const router = express.Router();

export interface UserRequest extends Request {
  user?: { userId: string };
}

router.get(
  "/me",
  authenticateToken,
  async (req: UserRequest, res: Response) => {
    try {
      // Tìm user trong database
      const user = await User.findOne({ _id: req.user?.userId });

      if (!user) {
        res.status(401).json({ message: "user/me: User không tồn tại" });
        return;
      }

      res.status(200).json({
        id: user._id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("user/me:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
