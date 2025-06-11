import Property from "../models/propertymodel.js";
import User from "../models/Usermodel.js";

// Get all booked properties
export const getBookedProperties = async (req, res) => {
  try {
    console.log("Fetching booked properties...");
    const bookedProperties = await Property.find({ isBooked: true })
      .populate("bookedBy", "name email")
      .sort({ bookingDate: -1 });

    console.log("Found properties:", bookedProperties.length);

    res.json({
      success: true,
      properties: bookedProperties,
    });
  } catch (error) {
    console.error("Error fetching booked properties:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booked properties",
    });
  }
};

// Mark property as booked
export const bookProperty = async (req, res) => {
  try {
    const { propertyId, userId } = req.body;

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

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update property booking status
    property.isBooked = true;
    property.bookedBy = userId;
    property.bookingDate = new Date();
    await property.save();

    res.json({
      success: true,
      message: "Property booked successfully",
      property,
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
