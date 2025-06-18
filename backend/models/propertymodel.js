import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: [String],
      required: true,
    },
    beds: {
      type: Number,
      required: true,
    },
    baths: {
      type: Number,
      required: true,
    },
    sqft: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    availability: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amenities: {
      type: [String],
      required: true,
      default: [],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bookingDate: {
      type: Date,
    },
    tokenAmount: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
    phone: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewDates: [
      {
        type: Date,
        default: Date.now,
      },
    ],
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
