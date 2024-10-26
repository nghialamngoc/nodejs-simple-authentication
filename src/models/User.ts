import mongoose, { Document, Schema } from "mongoose";

// Interface để định nghĩa cấu trúc của User document
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  userName: string;
  role: "user" | "admin";
  refreshToken: string;
  provider: "email" | "google";
  providerId?: string;
  isVerified?: boolean;
  avatar?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    userName: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },
    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    providerId: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Tạo và export model
export default mongoose.model<IUser>("User", UserSchema);
