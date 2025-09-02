import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },

    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    tokenExpiry: {
      type: Date,
    },
    emailCredits: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

// for a password + new confirm password+ otp   otp verify and then perform this action

//. email -> send otp to your mail set in User Table verify step is needed
