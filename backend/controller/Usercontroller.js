import express from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
import { getWelcomeTemplate, getOTPVerificationTemplate } from "../email.js";
import { getPasswordResetTemplate } from "../email.js";

const backendurl = process.env.BACKEND_URL;

const createtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

dotenv.config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Registeruser = await userModel.findOne({ email });
    if (!Registeruser) {
      return res.json({ message: "Email not found", success: false });
    }
    
    // Check if email is verified
    if (!Registeruser.isVerified) {
      return res.json({ 
        message: "Please verify your email before logging in. Check your inbox for a verification code.", 
        success: false,
        needsVerification: true 
      });
    }
    
    const isMatch = await bcrypt.compare(password, Registeruser.password);
    if (isMatch) {
      const token = createtoken(Registeruser._id);
      return res.json({
        token,
        user: { name: Registeruser.name, email: Registeruser.email },
        success: true,
      });
    } else {
      return res.json({ message: "Invalid password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.json({ message: "Invalid email", success: false });
    }
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already registered", success: false });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    const newUser = new userModel({ 
      name, 
      email, 
      password: hashedPassword,
      otp,
      otpExpire,
      isVerified: false
    });
    await newUser.save();

    // Send OTP email
    const mailOptions = {
      from: `BuildEstate <${process.env.EMAIL}>`,
      to: email,
      subject: "Verify Your Email - BuildEstate",
      html: getOTPVerificationTemplate(name, otp),
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      message: "Account created successfully! Please check your email for the verification code.",
      success: true,
      needsVerification: true
    });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await userModel.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired verification code", 
        success: false 
      });
    }
    
    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    
    // Send welcome email
    const mailOptions = {
      from: `BuildEstate <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Welcome to BuildEstate - Your Account Has Been Verified",
      html: getWelcomeTemplate(user.name),
    };
    
    await transporter.sendMail(mailOptions);
    
    return res.json({
      message: "Email verified successfully! You can now log in to your account.",
      success: true
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: "Email not found", 
        success: false 
      });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ 
        message: "Email is already verified", 
        success: false 
      });
    }
    
    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();
    
    // Send new OTP email
    const mailOptions = {
      from: `BuildEstate <${process.env.EMAIL}>`,
      to: email,
      subject: "Verify Your Email - BuildEstate",
      html: getOTPVerificationTemplate(user.name, otp),
    };
    
    await transporter.sendMail(mailOptions);
    
    return res.json({
      message: "Verification code sent successfully!",
      success: true
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found", success: false });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.WEBSITE_URL}/reset/${resetToken}`;
    const mailOptions = {
      from: `BuildEstate <${process.env.EMAIL}>`,
      to: email,
      subject: "Password Reset - BuildEstate Security",
      html: getPasswordResetTemplate(resetUrl),
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", success: false });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    return res
      .status(200)
      .json({ message: "Password reset successful", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Attempting admin login for:", email);

    const user = await userModel.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        message: "Invalid admin credentials",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({
        message: "Invalid admin credentials",
        success: false,
      });
    }

    // Check if user is an admin
    if (!user.isAdmin) {
      console.log("User is not an admin");
      return res.status(403).json({
        message: "Access denied. Not an admin account.",
        success: false,
      });
    }

    // Create token with admin info
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Admin login successful");
    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      message: "Server error during admin login",
      success: false,
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.json({ message: "Logged out", success: true });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
};

// get name and email

const getname = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
};

export {
  login,
  register,
  verifyOTP,
  resendOTP,
  forgotpassword,
  resetpassword,
  adminlogin,
  logout,
  getname,
};
