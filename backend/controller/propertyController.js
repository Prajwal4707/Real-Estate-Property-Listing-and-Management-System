import mongoose from "mongoose";
import Property from "../models/propertymodel.js";
import firecrawlService from "../services/firecrawlService.js";
import aiService from "../services/aiService.js";

const searchProperties = async (req, res) => {
  try {
    const {
      city,
      maxPrice,
      propertyCategory,
      propertyType,
      limit = 6,
    } = req.body;

    if (!city || !maxPrice) {
      return res
        .status(400)
        .json({ success: false, message: "City and maxPrice are required" });
    }

    // First, get all blocked properties from the database
    const blockedProperties = await Property.find({ isBlocked: true });
    const blockedPropertyIds = blockedProperties.map(p => p._id.toString());

    // Extract property data using Firecrawl, specifying the limit
    const propertiesData = await firecrawlService.findProperties(
      city,
      maxPrice,
      propertyCategory || "Residential",
      propertyType || "Flat",
      Math.min(limit, 6) // Limit to max 6 properties
    );

    // Filter out blocked properties
    const filteredProperties = propertiesData.properties.filter(
      property => !blockedPropertyIds.includes(property._id?.toString())
    );

    // Analyze the properties using AI
    const analysis = await aiService.analyzeProperties(
      filteredProperties,
      city,
      maxPrice,
      propertyCategory || "Residential",
      propertyType || "Flat"
    );

    res.json({
      success: true,
      properties: filteredProperties,
      analysis,
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search properties",
      error: error.message,
    });
  }
};

const getLocationTrends = async (req, res) => {
  try {
    const { city } = req.params;
    const { limit = 5 } = req.query;

    if (!city) {
      return res
        .status(400)
        .json({ success: false, message: "City parameter is required" });
    }

    // Extract location trend data using Firecrawl, with limit
    const locationsData = await firecrawlService.getLocationTrends(
      city,
      Math.min(limit, 5)
    );

    // Analyze the location trends using AI
    const analysis = await aiService.analyzeLocationTrends(
      locationsData.locations,
      city
    );

    res.json({
      success: true,
      locations: locationsData.locations,
      analysis,
    });
  } catch (error) {
    console.error("Error getting location trends:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get location trends",
      error: error.message,
    });
  }
};

// Verify payment for a property
const verifyPayment = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Ensure user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to verify payments",
      });
    }

    // Find the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Get the Appointment model
    const Appointment = mongoose.model("Appointment");

    // Find the associated appointment
    const appointment = await Appointment.findOne({
      propertyId: propertyId,
      status: "confirmed",
      visited: true,
    }).populate("userId", "name email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "No confirmed appointment found for this property",
      });
    }

    // Update both property and appointment payment status
    property.paymentStatus = "verified";
    appointment.payment.status = "completed";
    appointment.payment.paidAt = new Date();

    // Save both documents
    await Promise.all([property.save(), appointment.save()]);

    res.json({
      success: true,
      message: "Payment verified successfully",
      property: await property.populate("bookedBy", "name email"),
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
};

// Block a property
const blockProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to block properties",
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Update property status
    property.isBlocked = true;
    property.isBooked = true;
    property.availability = "Booked";
    await property.save();

    // Also update any existing appointments for this property
    const Appointment = mongoose.model("Appointment");
    await Appointment.updateMany(
      { propertyId: id },
      { status: "completed" }
    );

    res.json({
      success: true,
      message: "Property blocked successfully",
      property: await property.populate("bookedBy", "name email"),
    });
  } catch (error) {
    console.error("Error blocking property:", error);
    res.status(500).json({
      success: false,
      message: "Error blocking property",
    });
  }
};

// Unblock a property
const unblockProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to unblock properties",
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Update property status
    property.isBlocked = false;
    property.isBooked = false; // Allow bookings again
    property.availability = "Available"; // Update availability status
    await property.save();

    res.json({
      success: true,
      message: "Property unblocked successfully",
      property: await property.populate("bookedBy", "name email"),
    });
  } catch (error) {
    console.error("Error unblocking property:", error);
    res.status(500).json({
      success: false,
      message: "Error unblocking property",
    });
  }
};

// Delete a property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete properties",
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Delete any associated appointments
    const Appointment = mongoose.model("Appointment");
    await Appointment.deleteMany({ propertyId: id });

    // Delete the property
    await Property.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting property",
    });
  }
};

export {
  searchProperties,
  getLocationTrends,
  blockProperty,
  unblockProperty,
  verifyPayment,
  deleteProperty,
};
