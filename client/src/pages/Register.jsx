import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";
import GoogleButton from "../components/GoogleButton";
import Home from "./Home";
import { useAuth } from "../context/AuthContext";
import {
  isValidEthiopianPhone,
  isValidEmail,
  normalizeEthiopianPhone
} from "../utils/validation";

const Register = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [phoneExists, setPhoneExists] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.fullName || form.fullName.trim().length < 3)
      errs.fullName = "Full name must be at least 3 characters";
    if (!isValidEmail(form.email)) errs.email = "Enter a valid email address";
    if (!isValidEthiopianPhone(form.phone))
      errs.phone =
        "Enter a valid Ethiopian phone number (e.g. 0912345678 or +251912345678)";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");
    setPhoneExists(false);
    try {
      await register({ ...form, phone: normalizeEthiopianPhone(form.phone) });
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors((prev) => ({ ...prev, ...data.errors }));
      else if (data?.action === "phone_exists") {
        setServerError(data.message);
        setPhoneExists(true);
      } else
        setServerError(
          data?.message || "Registration failed. Please try again."
        );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setServerError("");
    if (!isValidEthiopianPhone(form.phone)) {
      setErrors((e) => ({
        ...e,
        phone: "Enter a valid Ethiopian phone number to continue with Google"
      }));
      return;
    }
    try {
      await googleLogin({
        credential,
        phone: normalizeEthiopianPhone(form.phone)
      });
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Google sign-up failed.");
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
            Create your account
          </h1>
          {serverError && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}
          {phoneExists && (
            <div className="text-sm text-teal text-center mb-5">
              This phone is already registered. Use the login page and the phone
              OTP option to authenticate instead.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="label" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                className={`input-field ${errors.fullName ? "has-error" : ""}`}
                placeholder="Abebe Kebede"
              />
              {errors.fullName && (
                <p className="field-error">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? "has-error" : ""}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div>
              <label className="label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={`input-field ${errors.phone ? "has-error" : ""}`}
                placeholder="0912345678"
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

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
                  placeholder="At least 6 characters"
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

            <div>
              <label className="label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPw ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                className={`input-field ${errors.confirmPassword ? "has-error" : ""}`}
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && (
                <p className="field-error">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2 disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-dim text-xs uppercase tracking-wider">
              or
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <GoogleButton
            onCredential={handleGoogleCredential}
            requirePhone
            phoneValue={form.phone}
          />

          <p className="text-center text-dim text-sm mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal hover:text-teal-light font-medium"
            >
              Log in
            </Link>
            <p>
              <button
                className="text-teal hover:text-teal-light"
                onClick={() => navigate(-2)}
              >
                ← Go Back
              </button>
            </p>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
