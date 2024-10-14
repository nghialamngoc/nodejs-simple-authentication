import mongoose, { Document, Schema } from "mongoose";

// Interface để định nghĩa cấu trúc của User document
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  refreshToken: string;
}

// Schema definition
const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    refreshToken: { type: String },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Tạo và export model
export default mongoose.model<IUser>("User", UserSchema);
