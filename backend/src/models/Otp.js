import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["password_reset", "email_verification", "otp_verify"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export const Otp = mongoose.model("Otp", otpSchema);
