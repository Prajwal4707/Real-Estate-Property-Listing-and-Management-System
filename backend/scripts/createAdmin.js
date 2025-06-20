import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/Usermodel.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB using your connection string
    const MONGODB_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Admin credentials - you can change these
    const adminData = {
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      isAdmin: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin user already exists");
      let updated = false;
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        updated = true;
      }
      // Always update the password
      existingAdmin.password = await bcrypt.hash(adminData.password, 10);
      updated = true;
      await existingAdmin.save();
      if (updated) {
        console.log("Updated existing admin user (password and/or isAdmin flag)");
      }
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Create new admin user
      const newAdmin = new User({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        isAdmin: true,
      });

      await newAdmin.save();
      console.log("Admin user created successfully");
    }

    // Display admin credentials
    console.log("\nAdmin Login Credentials:");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdminUser();
