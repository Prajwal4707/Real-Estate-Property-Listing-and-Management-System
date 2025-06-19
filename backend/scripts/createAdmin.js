import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/Usermodel.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB using your connection string
    const MONGODB_URI ="mongodb+srv://<username>:<db_password>@cluster0.umfpypu.mongodb.net/<db_name>?retryWrites=true&w=majority";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Admin credentials - you can change these
    const adminData = {
      name: "Admin",
      email: "admin@buildestate.com",
      password: "admin123", // You should change this in production
      isAdmin: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin user already exists");
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log("Updated existing user to admin");
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
