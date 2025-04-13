import mongoose, { Document, Schema } from "mongoose";

export interface IToken extends Document {
  userId: string;
  token: string;
  type: "refresh";
  expiresAt: Date;
  isRevoked: boolean;
}

const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["refresh"],
      default: "refresh",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index to automatically remove expired tokens
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model<IToken>("Token", TokenSchema);
