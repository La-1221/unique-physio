import express from "express";
import {
  register,
  login,
  googleAuth,
  sendPhoneOtp,
  verifyPhoneOtp,
  getMe,
  logout
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/otp/send", sendPhoneOtp);
router.post("/otp/verify", verifyPhoneOtp);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
