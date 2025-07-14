import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpire: { type: Date },
  resetToken: { type: String },
  resetTokenExpire: { type: Date },
});

const User = mongoose.model("User", UserSchema);

export default User;
