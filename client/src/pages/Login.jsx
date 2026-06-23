import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";
import GoogleButton from "../components/GoogleButton";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, googleLogin, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: undefined }));
    setServerError("");
    if (e.target.name === "identifier") {
      setOtpSent(false);
      setOtpCode("");
      setInfoMessage("");
    }
  };

  const handleSendOtp = async () => {
    const errs = {};
    if (!form.identifier.trim()) errs.identifier = "Enter your phone number";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError("");
    setInfoMessage("");
    try {
      await sendPhoneOtp({ phone: form.identifier });
      setOtpSent(true);
      setInfoMessage("OTP sent to your phone. Enter it below to continue.");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Unable to send OTP. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const errs = {};
    if (!form.identifier.trim()) errs.identifier = "Enter your phone number";
    if (!otpCode.trim()) errs.code = "Enter the OTP code";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      await verifyPhoneOtp({ phone: form.identifier, code: otpCode });
      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.identifier.trim())
      errs.identifier = "Enter your email or phone number";
    if (!form.password) errs.password = "Enter your password";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setServerError("");
    try {
      await googleLogin({ credential });
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Google login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16 bg-gradient-to-b from-teal-deep/10 to-bg">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="font-display font-bold text-2xl text-center mb-1">
            Welcome back
          </h1>
          <p className="text-dim text-sm text-center mb-7">
            Log in to manage appointments and your account
          </p>

          {serverError && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="label" htmlFor="identifier">
                {otpMode ? "Phone number" : "Email or Phone"}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={handleChange}
                className={`input-field ${errors.identifier ? "has-error" : ""}`}
                placeholder={
                  otpMode ? "0912345678" : "you@example.com or 0912345678"
                }
              />
              {errors.identifier && (
                <p className="field-error">{errors.identifier}</p>
              )}
            </div>

            {otpMode ? (
              <>
                {otpSent && (
                  <div>
                    <label className="label" htmlFor="otpCode">
                      OTP Code
                    </label>
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className={`input-field ${errors.code ? "has-error" : ""}`}
                      placeholder="123456"
                    />
                    {errors.code && (
                      <p className="field-error">{errors.code}</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                  disabled={submitting}
                  className="btn-primary w-full mt-2 disabled:opacity-60"
                >
                  {submitting
                    ? "Processing…"
                    : otpSent
                      ? "Verify OTP"
                      : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className={`input-field pr-11 ${errors.password ? "has-error" : ""}`}
                      placeholder="Your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dim hover:text-ink"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="field-error">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full mt-2 disabled:opacity-60"
                >
                  {submitting ? "Logging in…" : "Log In"}
                </button>
              </>
            )}
          </form>

          {infoMessage && (
            <p className="text-sm text-teal text-center mt-3">{infoMessage}</p>
          )}

          <div className="text-center mt-4">
            <button
              type="button"
              className="text-teal hover:text-teal-light font-medium"
              onClick={() => {
                setOtpMode((prev) => !prev);
                setErrors({});
                setServerError("");
                setInfoMessage("");
                setOtpSent(false);
                setOtpCode("");
                setForm((f) => ({ ...f, password: "" }));
              }}
            >
              {otpMode ? "Use password login instead" : "Use phone OTP instead"}
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-dim text-xs uppercase tracking-wider">
              or
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <GoogleButton onCredential={handleGoogleCredential} />

          <p className="text-center text-dim text-sm mt-7">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-teal hover:text-teal-light font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
