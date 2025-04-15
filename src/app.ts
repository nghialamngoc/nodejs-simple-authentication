import dotenv from "dotenv";
import path from "path";

const environment = process.env.NODE_ENV || "development";

// Load file .env tương ứng **first**
dotenv.config({
  path: path.resolve(__dirname, `../.env.${environment}`),
});

// Now import other modules
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { routes } from "./routes";
import { connectDB } from "./config/database";
import { config } from "./config"; // Import config after dotenv
import { logger } from "./utils/logger";
import cookieParser from "cookie-parser";

// Create Express app
const app = express();

// Middlewares
app.use(
  cors({
    origin: config.allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

connectDB();

// Start server
app.listen(config.port, () => {
  logger.info(
    `Server running in ${config.nodeEnv} mode on port ${config.port}`
  );
});
