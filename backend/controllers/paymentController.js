import Razorpay from "razorpay";
import crypto from "crypto";
import Appointment from "../models/appointmentModel.js";

const razorpay = new Razorpay({
  key_id: "rzp_test_meL58e1NfBNqxd",
  key_secret: "geS94AazUCXTzXRGaEm1fhei", // Replace with your key secret
});

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (!appointment.visited) {
      return res.status(400).json({
        success: false,
        message: "Appointment must be marked as visited before payment",
      });
    }

    const options = {
      amount: amount,
      currency: "INR",
      receipt: appointmentId,
    };

    const order = await razorpay.orders.create(options);

    // Update appointment with order details
    appointment.payment = {
      orderId: order.id,
      amount: amount,
      status: "pending",
    };
    await appointment.save();

    res.json({
      success: true,
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Could not create order" });
  }
};

// Verify payment after successful payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Verify signature
    const signatureVerify = crypto
      .createHmac("sha256", "YOUR_KEY_SECRET") // Replace with your key secret
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (signatureVerify !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Update appointment payment details
    appointment.payment = {
      ...appointment.payment,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "completed",
      paidAt: new Date(),
    };
    await appointment.save();

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not verify payment" });
  }
};
