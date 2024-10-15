import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import connectDB from "./database";
import { AuthRequest, authenticateToken } from "./middleware/auth";
import authRoutes from "./routes/auth";

// Xác định môi trường
const environment = process.env.NODE_ENV || "development";

// Load file .env tương ứng
dotenv.config({
  path: path.resolve(__dirname, `../.env.${environment}`),
});

console.log(`Current environment: ${environment}`);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS config
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

connectDB();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send(`Hello, TypeScript with MongoDB! Environment 1: ${environment}`);
});

app.get("/protected", authenticateToken, (req: AuthRequest, res) => {
  res.json({ message: "This is a protected route", userId: req.user?.userId });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${environment} mode`);
});
