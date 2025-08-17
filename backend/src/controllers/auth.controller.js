import {
  loginService,
  registerService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
} from "../services/auth.service.js";

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
