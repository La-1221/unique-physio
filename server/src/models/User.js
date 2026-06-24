import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  ROLES,
  ETHIOPIAN_PHONE_REGEX,
  EMAIL_REGEX
} from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => EMAIL_REGEX.test(v),
        message: (props) => `${props.value} is not a valid email address`
      }
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: false, // allow multiple users with the same phone number for OTP login
      trim: true,
      validate: {
        validator: (v) => ETHIOPIAN_PHONE_REGEX.test(v),
        message: (props) =>
          `${props.value} is not a valid Ethiopian phone number. Use format +2519XXXXXXXX or +2517XXXXXXXX`
      }
    },
    password: {
      type: String,
      // not required if signing up with Google
      required: function () {
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true // <--- ADD THIS! It tells MongoDB to ignore null values.
    },
    avatar: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.PATIENT
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Hash password before saving, only if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    avatar: this.avatar,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

const User = mongoose.model("User", userSchema);

export default User;
