import { Router } from "express";
import {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyUser,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-user", authenticate, verifyUser);

export default router;
