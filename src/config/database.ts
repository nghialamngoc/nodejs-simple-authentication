import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "internal-project",
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB Connected error: ${error.message}`);
    } else {
      logger.error("Unknown error occurred while connecting to MongoDB");
    }
    process.exit(1);
  }
};
