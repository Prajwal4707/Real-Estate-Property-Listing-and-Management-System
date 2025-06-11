import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    visited: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    meetingPlatform: {
      type: String,
      enum: ["zoom", "google-meet", "teams", "other"],
      default: "other",
    },
    notes: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
    },
    payment: {
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
      amount: { type: Number },
      status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
      },
      paidAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ propertyId: 1, date: -1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
