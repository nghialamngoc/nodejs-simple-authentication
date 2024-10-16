import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import connectDB from "./database";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

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

app.get("/", (req, res) => {
  res.send(`Hello, TypeScript with MongoDB! Environment 1: ${environment}`);
});

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${environment} mode`);
});
