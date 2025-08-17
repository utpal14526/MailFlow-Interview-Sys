import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import { Otp } from "../models/Otp.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASSWORD,
  },
});

export const registerService = async (
  name,
  email,
  password,
  confirmPassword
) => {
  if (!name || !email || !password || !confirmPassword) {
    throw new Error("Name, email, and password are required");
  }
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (password.length < 6) {
    throw new Error("Password too short");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  const payload = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
  };

  const token = generateToken(payload);

  return {
    user: payload,
    token: token,
  };
};

export const loginService = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  const token = generateToken(payload);

  return {
    user: payload,
    token: token,
  };
};

export const forgotPasswordService = async (email) => {
  if (!email) throw new Error("Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const rawOtp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const hashedOtp = await bcrypt.hash(rawOtp, 10);

  // delete all these for this email make new entry for this
  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp: hashedOtp,
    purpose: "password_reset",
    expiresAt: new Date(Date.now() + 1 * 60 * 1000),
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL,
    to: email,
    subject: "Your Password Reset OTP",
    text: `Your OTP is: ${rawOtp}. It will expire in 1 minute`,
  });

  return { message: "OTP sent to email" };
};

export const verifyOtpService = async (email, otp) => {
  const otpRecord = await Otp.findOne({ email, purpose: "password_reset" });
  if (!otpRecord) throw new Error("OTP not found");

  if (otpRecord.expiresAt < new Date())
    throw new Error("OTP expired ! Retry Again");

  const isMatch = await bcrypt.compare(otp, otpRecord.otp);
  if (!isMatch) throw new Error("Invalid OTP");

  await Otp.updateOne(
    { email, purpose: "password_reset" },
    {
      $set: {
        purpose: "otp_verify",
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      },
    }
  );
  return { message: "OTP verified successfully" };
};

export const resetPasswordService = async (
  email,
  otp,
  newPassword,
  confirmPassword
) => {
  if (newPassword !== confirmPassword)
    throw new Error("Passwords do not match");
  if (newPassword.length < 6) {
    throw new Error("Password too short");
  }

  const otpRecord = await Otp.findOne({ email, purpose: "otp_verify" });
  if (!otpRecord) throw new Error("OTP not found");

  if (otpRecord.expiresAt < new Date())
    throw new Error("Session expired! Retry Again");

  const isMatch = await bcrypt.compare(otp, otpRecord.otp);
  if (!isMatch) throw new Error("Invalid OTP");

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) throw new Error("New password cannot be same as old password");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Otp.deleteMany({ email, purpose: "otp_verify" });

  return { message: "Password reset successful" };
};
