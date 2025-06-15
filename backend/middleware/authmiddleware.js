import jwt from "jsonwebtoken";
import userModel from "../models/Usermodel.js";
import Appointment from "../models/appointmentModel.js";

export const protect = async (req, res, next) => {
  try {
    console.log("Auth Headers:", req.headers);
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid authorization header found");
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted:", token.substring(0, 20) + "...");

    if (!token) {
      console.log("No token found after split");
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", {
      id: decoded.id,
      isAdmin: decoded.isAdmin,
      iat: decoded.iat,
      exp: decoded.exp,
    });

    const user = await userModel.findById(decoded.id);
    console.log(
      "Database query result:",
      user
        ? {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
          }
        : "No user found"
    );

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    console.log("User attached to request, proceeding to next middleware");
    next();
  } catch (error) {
    console.error("Auth error details:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

export const checkAppointmentOwnership = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this appointment",
      });
    }

    req.appointment = appointment;
    next();
  } catch (error) {
    console.error("Error checking appointment ownership:", error);
    res.status(500).json({
      success: false,
      message: "Error checking appointment ownership",
    });
  }
};

export default protect;
