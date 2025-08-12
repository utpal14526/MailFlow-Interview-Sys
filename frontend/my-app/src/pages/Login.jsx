import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("login"); // login | forgot | otp | reset
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      if (res && res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        toast.success(res.data.message || "Login successful!", {
          autoClose: 3000,
        });
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed", {
        autoClose: 3000,
      });
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      toast.success("OTP sent to your email");
      setStep("otp");
      setTimer(60);
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending OTP");
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email, otp });
      toast.success("OTP verified");
      setStep("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/api/auth/reset-password`, {
        email,
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset successfully");
      setStep("login");
      setEmail("");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  }

  return (
    <div className="login-container">
      <ToastContainer />
      {step === "login" && (
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Login</h2>

          <label>Email</label>
          <input
            type="email"
            className="login-input"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              title="Toggle password visibility"
              style={{ cursor: "pointer" }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
          <p
            className="forgot-text"
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => setStep("forgot")}
          >
            Forgot Password?
          </p>

          <p className="signin-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      )}

      {step === "forgot" && (
        <form className="login-form" onSubmit={handleForgotPassword}>
          <label>Email</label>
          <input
            type="email"
            className="login-input"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="login-button">
            Send OTP
          </button>
          <p
            style={{ color: "blue", cursor: "pointer", marginTop: "10px" }}
            onClick={() => {
              setStep("login");
              setEmail("");
              setPassword("");
              setOtp("");
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Back to Login
          </p>
        </form>
      )}

      {step === "otp" && (
        <form className="login-form" onSubmit={handleVerifyOtp}>
          <h2>Enter OTP</h2>
          <input
            type="text"
            className="login-input"
            placeholder="Enter OTP"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button type="submit" className="login-button">
            Verify OTP
          </button>
          {timer > 0 ? (
            <p>Resend OTP in {timer}s</p>
          ) : (
            <p
              style={{ color: "blue", cursor: "pointer" }}
              onClick={handleForgotPassword}
            >
              Resend OTP
            </p>
          )}
          <p
            style={{ color: "blue", cursor: "pointer", marginTop: "10px" }}
            onClick={() => {
              setStep("login");
              setEmail("");
              setPassword("");
              setOtp("");
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Back to Login
          </p>
        </form>
      )}

      {step === "reset" && (
        <form className="login-form" onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>

          <div className="password-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              className="login-input"
              placeholder="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              onClick={() => setShowNewPassword((prev) => !prev)}
              style={{ cursor: "pointer" }}
              title="Toggle password visibility"
            >
              {showNewPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="login-input"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              style={{ cursor: "pointer" }}
              title="Toggle password visibility"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" className="login-button">
            Reset Password
          </button>
          <p
            style={{ color: "blue", cursor: "pointer", marginTop: "10px" }}
            onClick={() => {
              setStep("login");
              setEmail("");
              setPassword("");
              setOtp("");
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Back to Login
          </p>
        </form>
      )}
    </div>
  );
}

export default Login;
