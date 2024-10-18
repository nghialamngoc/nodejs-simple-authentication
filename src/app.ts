import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import connectDB from "./database";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import cookieParser from "cookie-parser";

// Xác định môi trường
const environment = process.env.NODE_ENV || "development";

// Load file .env tương ứng
dotenv.config({
  path: path.resolve(__dirname, `../.env.${environment}`),
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

console.log(`Current environment: ${environment}`);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS config
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Hello, TypeScript with MongoDB! Environment 1: ${environment}`);
});

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${environment} mode`);
});
