import express from "express";
import connectDB from "./database";
import dotenv from "dotenv";
import path from "path";

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

app.get("/", (req, res) => {
  res.send(`Hello, TypeScript with MongoDB! Environment: ${environment}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${environment} mode`);
});
