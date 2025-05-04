import mongoose, { Document, Schema, Types } from "mongoose";
import * as bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  provider: "local" | "google" | "facebook";
  providerId: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    providerId: {
      type: String,
      unique: true,
      sparse: true, // Cho phép nhiều document có providerId là null
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
    },
    roles: {
      type: [String],
      default: ["user"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    recoveryCodes: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
