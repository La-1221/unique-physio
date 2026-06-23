import OtpCode from "../models/OtpCode.js";

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtpToPhone = async (phone, code) => {
  // Replace this with your SMS provider integration.
  // For now, this logs the OTP so you can test the flow locally.
  console.log(`OTP for ${phone}: ${code}`);
};

export const saveOtp = async (phone, code) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await OtpCode.findOneAndUpdate(
    { phone },
    { code, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const verifyOtp = async (phone, code) => {
  const otp = await OtpCode.findOne({ phone, code });
  if (!otp) return false;
  if (otp.expiresAt < new Date()) return false;
  await OtpCode.deleteOne({ phone });
  return true;
};
