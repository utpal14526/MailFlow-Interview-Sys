import {
  loginService,
  registerService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
} from "../services/auth.service.js";
import { google } from "googleapis";
import { User } from "../models/User.js";

import dotenv from "dotenv";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5002/api/auth/google/callback"
);

// Step 1: Generate Google OAuth URL
export const googleAuth = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    console.log("DEBUG3");
    const code = req.query.code;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    console.log(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const { data } = await oauth2.userinfo.get();
    const { email, name } = data;

    console.log(data);

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        provider: "google",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      });
    } else {
      // Update existing user with new tokens
      console.log("DEBUg1");
      user.accessToken = tokens.access_token;
      user.refreshToken = tokens.refresh_token;
      user.tokenExpiry = tokens.expiry_date;
      user.provider = "google";
    }

    await user.save();

    res.redirect(`http://localhost:3000/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google authentication failed" });
  }
};

export const findUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .select("-accessToken")
      .select("-refreshToken")
      .select("-tokenExpiry");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
      message: "User information fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch user information",
      success: false,
      message: "Failed to fetch user information",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    res.status(200).json({
      user: data.user,
      token: data.token,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
      success: false,
      message: "Login failed",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const data = await registerService(name, email, password, confirmPassword);
    res.status(201).json({
      user: data.user,
      token: data.token,
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Registration failed",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await forgotPasswordService(email);
    res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    await verifyOtpService(email, otp);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    await resetPasswordService(email, otp, newPassword, confirmPassword);
    res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in.",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "Password reset failed",
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      success: false,
      message: "User verification failed",
    });
  }
};
