import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { ROLES } from "../config/constants.js";
import { sendTokenResponse } from "../utils/jwt.js";
import {
  normalizeEthiopianPhone,
  isValidEthiopianPhone
} from "../utils/phone.js";
import {
  generateOtp,
  saveOtp,
  sendOtpToPhone,
  verifyOtp
} from "../utils/otp.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user (admin / receptionist / patient)
// @route   POST /api/auth/register
// @access  Public
// NOTE: the very first account ever created on this system becomes admin.
// All subsequent self-registrations default to 'patient'; only an existing
// admin can promote someone to receptionist/admin afterwards.
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, confirmPassword } = req.body;

  const fieldErrors = {};
  if (!fullName || fullName.trim().length < 3) {
    fieldErrors.fullName = "Full name must be at least 3 characters";
  }
  if (!email) fieldErrors.email = "Email is required";
  if (!phone) {
    fieldErrors.phone = "Phone number is required";
  } else if (!isValidEthiopianPhone(phone)) {
    fieldErrors.phone =
      "Enter a valid Ethiopian phone number (e.g. +251912345678)";
  }
  if (!password || password.length < 6) {
    fieldErrors.password = "Password must be at least 6 characters";
  }
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(fieldErrors).length) {
    res.status(400);
    return res.json({
      success: false,
      message: "Validation failed",
      errors: fieldErrors
    });
  }

  const normalizedPhone = normalizeEthiopianPhone(phone);

  const existingEmail = await User.findOne({
    email: email.toLowerCase().trim()
  });
  if (existingEmail) {
    res.status(400);
    return res.json({
      success: false,
      message: "Validation failed",
      errors: { email: "This email is already registered." }
    });
  }
  const existingPhone = await User.findOne({ phone: normalizedPhone });
  if (existingPhone) {
    res.status(409);
    return res.json({
      success: false,
      message:
        "This phone number is already registered. You can authenticate with an OTP instead.",
      action: "phone_exists"
    });
  }

  const isFirstUser = (await User.countDocuments({})) === 0;

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: normalizedPhone,
    password,
    role: isFirstUser ? ROLES.ADMIN : ROLES.PATIENT
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login with email or phone + password
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    return res.json({
      success: false,
      message: "Validation failed",
      errors: {
        identifier: !identifier ? "Email or phone is required" : undefined,
        password: !password ? "Password is required" : undefined
      }
    });
  }

  const isEmail = identifier.includes("@");
  const query = isEmail
    ? { email: identifier.toLowerCase().trim() }
    : { phone: normalizeEthiopianPhone(identifier) };

  const user = await User.findOne(query).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    return res.json({
      success: false,
      message: "Invalid credentials. Check your email/phone and password."
    });
  }

  if (!user.isActive) {
    res.status(403);
    return res.json({
      success: false,
      message: "This account has been deactivated. Contact the clinic admin."
    });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Send OTP to phone for login or registration
// @route   POST /api/auth/otp/send
// @access  Public
export const sendPhoneOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone || !isValidEthiopianPhone(phone)) {
    res.status(400);
    return res.json({
      success: false,
      message: "Validation failed",
      errors: {
        phone: "Enter a valid Ethiopian phone number (e.g. +251912345678)"
      }
    });
  }

  const normalizedPhone = normalizeEthiopianPhone(phone);
  const code = generateOtp();

  await saveOtp(normalizedPhone, code);
  await sendOtpToPhone(normalizedPhone, code);

  res.json({
    success: true,
    message: "OTP sent to your phone. It is valid for 5 minutes."
  });
});

// @desc    Verify OTP and login/register the user
// @route   POST /api/auth/otp/verify
// @access  Public
export const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { phone, code, fullName, email } = req.body;

  if (!phone || !isValidEthiopianPhone(phone)) {
    res.status(400);
    return res.json({
      success: false,
      message: "Validation failed",
      errors: {
        phone: "Enter a valid Ethiopian phone number (e.g. +251912345678)"
      }
    });
  }
  if (!code || !/^[0-9]{6}$/.test(code)) {
    res.status(400);
    return res.json({
      success: false,
      message: "Validation failed",
      errors: { code: "Enter the 6-digit OTP code" }
    });
  }

  const normalizedPhone = normalizeEthiopianPhone(phone);
  const validOtp = await verifyOtp(normalizedPhone, code);

  if (!validOtp) {
    res.status(400);
    return res.json({
      success: false,
      message: "Invalid or expired OTP. Please request a new code."
    });
  }

  let user = await User.findOne({ phone: normalizedPhone });
  if (!user) {
    if (!email) {
      res.status(400);
      return res.json({
        success: false,
        message: "Email is required to complete registration with phone OTP."
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400);
      return res.json({
        success: false,
        message: "Please provide a valid email address."
      });
    }
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim()
    });
    if (existingEmail) {
      res.status(400);
      return res.json({
        success: false,
        message: "This email is already registered."
      });
    }

    const isFirstUser = (await User.countDocuments({})) === 0;
    user = await User.create({
      fullName: fullName?.trim() || "New Patient",
      email: email.toLowerCase().trim(),
      phone: normalizedPhone,
      password: Math.random().toString(36).slice(-12),
      role: isFirstUser ? ROLES.ADMIN : ROLES.PATIENT
    });
  }

  if (!user.isActive) {
    res.status(403);
    return res.json({
      success: false,
      message: "This account has been deactivated. Contact the clinic admin."
    });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Continue with Google (sign up or login)
// @route   POST /api/auth/google
// @access  Public
// NOTE: requires a real GOOGLE_CLIENT_ID in server/.env. Until then this
// route returns a clear setup error instead of crashing, matching the
// "invalid_client" state seen during setup.
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, phone } = req.body;

  if (
    !process.env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID.startsWith("REPLACE_WITH")
  ) {
    res.status(503);
    return res.json({
      success: false,
      message:
        'Google Sign-In is not configured yet. Add a real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env (see README "Google OAuth setup").'
    });
  }

  if (!credential) {
    res.status(400);
    return res.json({
      success: false,
      message: "Missing Google credential token."
    });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email }]
  });

  if (!user) {
    // Google sign-up still needs an Ethiopian phone number per clinic policy
    if (!phone || !isValidEthiopianPhone(phone)) {
      res.status(400);
      return res.json({
        success: false,
        message: "Validation failed",
        errors: {
          phone:
            "A valid Ethiopian phone number is required to finish Google sign-up (e.g. +251912345678)"
        }
      });
    }

    const isFirstUser = (await User.countDocuments({})) === 0;

    user = await User.create({
      fullName: payload.name,
      email: payload.email,
      phone: normalizeEthiopianPhone(phone),
      googleId: payload.sub,
      avatar: payload.picture,
      role: isFirstUser ? ROLES.ADMIN : ROLES.PATIENT
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    user.avatar = user.avatar || payload.picture;
    await user.save();
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Log out (clear cookie)
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });
  res.json({ success: true, message: "Logged out" });
});
