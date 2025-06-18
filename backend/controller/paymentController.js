import Razorpay from "razorpay";
import crypto from "crypto";
import Appointment from "../models/appointmentModel.js";
import Property from "../models/propertymodel.js";
import transporter from "../config/nodemailer.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate(
      "propertyId"
    ); // Populate property details to get the price

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
    } // Calculate 5% of property price
    // Convert price to paise and calculate 5%
    const propertyPrice = appointment.propertyId.price;
    let tokenAmount = Math.round(propertyPrice * 0.05 * 100); // Convert to paise and calculate 5%

    // Cap the amount at ₹500,000 (50,000,000 paise) for Razorpay test mode
    const MAX_TEST_AMOUNT = 50000000; // 5 lakhs in paise
    if (tokenAmount > MAX_TEST_AMOUNT) {
      tokenAmount = MAX_TEST_AMOUNT;
    }

    // Create Razorpay order
    const options = {
      amount: tokenAmount,
      currency: "INR",
      receipt: appointmentId,
    };
    const order = await razorpay.orders.create(options);

    // Update appointment with order details
    appointment.payment = {
      orderId: order.id,
      amount: tokenAmount,
      status: "pending",
    };
    await appointment.save();

    res.json({
      success: true,
      id: order.id,
      currency: order.currency,
      amount: tokenAmount,
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
    const appointment = await Appointment.findById(appointmentId)
      .populate("propertyId")
      .populate("userId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    } // Verify signature
    const signatureVerify = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (signatureVerify !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    } // Update appointment payment info while preserving the amount
    appointment.payment = {
      ...appointment.payment, // Keep existing payment data including amount
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "completed",
      paidAt: new Date(),
    }; // Save the updated appointment with payment info    // Save the updated appointment once
    await appointment.save();

    // Send confirmation email
    try {
      const mailOptions = {
        from: `BuildEstate <${process.env.EMAIL}>`,
        to: appointment.userId.email,
        subject: "Property Token Payment Confirmed - BuildEstate",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; animation: fadeIn 1s ease-in;">              <div style="background: #4CAF50; display: inline-block; padding: 15px; border-radius: 50%; margin-bottom: 20px;">
                <span style="color: white; font-size: 24px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: #2E7D32; margin: 20px 0; font-size: 28px; animation: slideDown 0.5s ease-out;">Payment Successful!</h2>
            </div>
            <div style="background: linear-gradient(145deg, #E8F5E9, #C8E6C9); padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0; animation: fadeIn 0.8s ease-in;">
              <h3 style="color: #1B5E20; margin-bottom: 15px; font-size: 20px;">Payment Details</h3>
              <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px;">
                <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #A5D6A7;">
                  <strong style="color: #2E7D32;">Property:</strong>
                  <span style="float: right; color: #333;">${
                    appointment.propertyId.title
                  }</span>
                </div>
                <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #A5D6A7;">
                  <strong style="color: #2E7D32;">Amount Paid:</strong>
                  <span style="float: right; color: #333;">₹${(
                    appointment.payment.amount / 100
                  ).toFixed(2)}</span>
                </div>
                <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #A5D6A7;">
                  <strong style="color: #2E7D32;">Date:</strong>
                  <span style="float: right; color: #333;">${new Date().toLocaleDateString()}</span>
                </div>
                <div style="margin: 10px 0; padding: 10px;">
                  <strong style="color: #2E7D32;">Payment ID:</strong>
                  <span style="float: right; color: #333;">${
                    appointment.payment.paymentId
                  }</span>
                </div>
              </div>
            </div>
            <div style="text-align: center; background: #E8F5E9; padding: 20px; border-radius: 8px; margin-top: 20px; animation: slideUp 0.5s ease-out;">
              <p style="color: #1B5E20; font-size: 16px; margin: 0;">Our team will contact you soon with next steps</p>
            </div>
          </div>
          <style>
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideDown {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          </style>
        `,
      };

      await transporter.sendMail(mailOptions);

      // Send notification to admin
      const adminMailOptions = {
        from: process.env.EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: "Property Token Payment Received - BuildEstate",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center;">              <div style="background: #4CAF50; display: inline-block; padding: 15px; border-radius: 50%; margin-bottom: 20px;">
                <span style="color: white; font-size: 24px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: #2E7D32; margin: 20px 0; font-size: 24px;">New Token Payment Received</h2>
            </div>
            <div style="background: linear-gradient(145deg, #E8F5E9, #C8E6C9); padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0;">
              <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px;">
                <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #A5D6A7;">
                  <strong style="color: #2E7D32;">Property:</strong>
                  <span style="float: right; color: #333;">${
                    appointment.propertyId.title
                  }</span>
                </div>
                <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #A5D6A7;">
                  <strong style="color: #2E7D32;">Client:</strong>
                  <span style="float: right; color: #333;">${
                    appointment.userId.name
                  }</span>
                </div>
                <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #A5D6A7;">
                  <strong style="color: #2E7D32;">Amount:</strong>
                  <span style="float: right; color: #333;">₹${(
                    appointment.payment.amount / 100
                  ).toFixed(2)}</span>
                </div>
                <div style="margin: 10px 0; padding: 10px;">
                  <strong style="color: #2E7D32;">Date:</strong>
                  <span style="float: right; color: #333;">${new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div style="text-align: center; background: #E8F5E9; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p style="color: #1B5E20; font-size: 16px; margin: 0;">Please verify the payment and contact the client to proceed with next steps.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(adminMailOptions);
    } catch (emailError) {
      console.error("Error sending confirmation emails:", emailError);
      // Continue execution - don't let email failure prevent success response
    }

    res.json({
      success: true,
      message: "Payment verified and property booked successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Error processing payment verification",
    });
  }
};
