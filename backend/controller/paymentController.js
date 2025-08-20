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
    } // Set a fixed token amount of ₹1,00,000 (in paise)
    let tokenAmount = 5000000; // ₹50,000

    // Cap the amount at ₹500,000 (50,00,000 paise) for Razorpay test mode
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
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', sans-serif; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%); padding: 20px; text-align: center;">
              <img src="https://ik.imagekit.io/ddtl85xea/home-regular-24.png?updatedAt=1753077766721" alt="Logo" style="height: 60px; border-radius: 12px; box-shadow: 0 2px 8px rgba(44,62,80,0.12); background: #fff; padding: 8px;">
              <h2 style="color: white; margin-top: 10px; font-weight: 600; letter-spacing: 1px;">BuildEstate</h2>
            </div>

            <!-- Payment Summary -->
            <div style="padding: 30px; text-align: center;">
              <h1 style="color: #1b5e20; font-size: 26px; margin-bottom: 10px;">₹${(appointment.payment.amount / 100).toFixed(2)}</h1>
              <p style="color: #4caf50; font-weight: bold; font-size: 16px; margin: 0;">
                <span style="display: inline-block; color: green; font-size: 18px;">✔</span>
                Paid Successfully
              </p>
            </div>

            <!-- Details Table -->
            <div style="padding: 0 30px 30px 30px;">
              <hr style="border: none; border-top: 2px solid #eee; margin-bottom: 20px;" />
              <table style="width: 100%; font-size: 15px; color: #333;">
              <tr style="height: 40px;">
                  <td><strong>Property</strong></td>
                  <td style="text-align: right;">${appointment.propertyId.title || ''}</td>
                </tr>
                <tr style="height: 40px;">
                  <td><strong>Payment Id</strong></td>
                  <td style="text-align: right;">${appointment.payment.paymentId || ''}</td>
                </tr>
                <tr style="height: 40px;">
                  <td><strong>Paid On</strong></td>
                  <td style="text-align: right;">${appointment.payment.paidAt ? new Date(appointment.payment.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</td>
                </tr>
              </table>
            </div>

            <!-- Footer -->
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #555;">
              <p style="margin: 0;">Email: <a href="mailto:${appointment.userId.email}" style="color: #1b5e20; text-decoration: none;">${appointment.userId.email}</a></p>
            </div>
          </div>
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
