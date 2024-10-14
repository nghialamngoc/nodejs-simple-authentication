import express from "express";
import connectDB from "./database";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth";
import { AuthRequest, authenticateToken } from "./middleware/auth";

// Xác định môi trường
const environment = process.env.NODE_ENV || "development";

// Load file .env tương ứng
dotenv.config({
  path: path.resolve(__dirname, `../.env.${environment}`),
});

console.log(`Current environment: ${environment}`);

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send(`Hello, TypeScript with MongoDB! Environment: ${environment}`);
});

app.get("/protected", authenticateToken, (req: AuthRequest, res) => {
  res.json({ message: "This is a protected route", userId: req.user?.userId });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${environment} mode`);
});
