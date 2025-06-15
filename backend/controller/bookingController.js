import Property from "../models/propertymodel.js";
import User from "../models/Usermodel.js";
import Appointment from "../models/appointmentModel.js";

// Get all booked properties for admin
export const getBookedProperties = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view booked properties",
      });
    }

    // Find all appointments that represent a booking (customize filter as needed)
    const bookings = await Appointment.find({
      status: { $in: ["confirmed", "completed"] },
    })
      .populate("propertyId")
      .populate("userId", "name email");

    // Only include bookings with valid property and user
    const properties = bookings
      .filter(booking => booking.propertyId && booking.userId)
      .map((booking) => ({
        ...booking.propertyId.toObject(),
        tokenAmount: booking.payment?.amount || 0,
        paymentStatus: booking.payment?.status || "pending",
        bookingDate: booking.date,
        bookedBy: booking.userId,
      }));

    res.json({ success: true, properties });
  } catch (error) {
    console.error("Error fetching booked properties:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booked properties: " + error.message,
    });
  }
};

// Mark property as booked
export const bookProperty = async (req, res) => {
  try {
    const { propertyId, userId, tokenAmount } = req.body;

    // Verify property exists and is not already booked
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.isBooked) {
      return res.status(400).json({
        success: false,
        message: "Property is already booked",
      });
    }

    // Update property with booking details
    property.isBooked = true;
    property.bookedBy = userId;
    property.bookingDate = new Date();
    property.tokenAmount = tokenAmount;
    property.paymentStatus = "pending";

    await property.save();

    res.json({
      success: true,
      message: "Property booked successfully",
      property: await property.populate("bookedBy", "name email"),
    });
  } catch (error) {
    console.error("Error booking property:", error);
    res.status(500).json({
      success: false,
      message: "Error booking property",
    });
  }
};

// Cancel property booking
export const cancelBooking = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (!property.isBooked) {
      return res.status(400).json({
        success: false,
        message: "Property is not booked",
      });
    }

    // Reset booking status
    property.isBooked = false;
    property.bookedBy = null;
    property.bookingDate = null;
    await property.save();

    res.json({
      success: true,
      message: "Property booking cancelled successfully",
      property,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
    });
  }
};
