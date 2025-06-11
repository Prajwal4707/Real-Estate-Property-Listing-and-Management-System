import Stats from "../models/statsModel.js";
import Property from "../models/propertymodel.js";
import Appointment from "../models/appointmentModel.js";
import User from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
import { getSchedulingEmailTemplate, getEmailTemplate } from "../email.js";

// Format helpers
const formatRecentProperties = (properties) => {
  return properties.map((property) => ({
    type: "property",
    description: `New property listed: ${property.title}`,
    timestamp: property.createdAt,
  }));
};

const formatRecentAppointments = (appointments) => {
  return appointments.map((appointment) => ({
    type: "appointment",
    description: `${appointment.userId.name} scheduled viewing for ${appointment.propertyId.title}`,
    timestamp: appointment.createdAt,
  }));
};

// Main stats controller
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalProperties,
      activeListings,
      totalUsers,
      pendingAppointments,
      recentActivity,
      viewsData,
      revenue,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      User.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      getRecentActivity(),
      getViewsData(),
      calculateRevenue(),
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        activeListings,
        totalUsers,
        pendingAppointments,
        recentActivity,
        viewsData,
        revenue,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
    });
  }
};

// Activity tracker
const getRecentActivity = async () => {
  try {
    const [recentProperties, recentAppointments] = await Promise.all([
      Property.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt"),
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("propertyId", "title")
        .populate("userId", "name"),
    ]);

    return [
      ...formatRecentProperties(recentProperties),
      ...formatRecentAppointments(recentAppointments),
    ].sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return [];
  }
};

// Views analytics
const getViewsData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Stats.aggregate([
      {
        $match: {
          endpoint: /^\/api\/products\/single\//,
          method: "GET",
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const labels = [];
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      labels.push(dateString);

      const stat = stats.find((s) => s._id === dateString);
      data.push(stat ? stat.count : 0);
    }

    return {
      labels,
      datasets: [
        {
          label: "Property Views",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  } catch (error) {
    console.error("Error generating chart data:", error);
    return {
      labels: [],
      datasets: [
        {
          label: "Property Views",
          data: [],
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }
};

// Revenue calculation
const calculateRevenue = async () => {
  try {
    const properties = await Property.find();
    return properties.reduce(
      (total, property) => total + Number(property.price),
      0
    );
  } catch (error) {
    console.error("Error calculating revenue:", error);
    return 0;
  }
};

// Appointment management
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("propertyId", "title location")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate(["propertyId", "userId"]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Send status update email
    try {
      // Email to user
      const userMailOptions = {
        from: `BuildEstate <${process.env.EMAIL}>`,
        to: appointment.userId.email,
        subject: `Viewing Appointment ${
          status.charAt(0).toUpperCase() + status.slice(1)
        } - BuildEstate`,
        html: getEmailTemplate(appointment, status),
      };

      await transporter.sendMail(userMailOptions);

      // If appointment is confirmed, send additional instructions
      if (status === "confirmed") {
        const confirmationMailOptions = {
          from: `BuildEstate <${process.env.EMAIL}>`,
          to: appointment.userId.email,
          subject: "Viewing Appointment Confirmed - Next Steps",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Your Viewing Appointment is Confirmed!</h2>
              <p>Here's what you need to know:</p>
              <ul>
                <li>Property: ${appointment.propertyId.title}</li>
                <li>Date: ${new Date(
                  appointment.date
                ).toLocaleDateString()}</li>
                <li>Time: ${appointment.time}</li>
              </ul>
              <h3>Preparation Tips:</h3>
              <ul>
                <li>Arrive 5-10 minutes early</li>
                <li>Bring a valid ID</li>
                <li>Prepare any questions you have about the property</li>
              </ul>
              <p>We look forward to meeting you!</p>
            </div>
          `,
        };
        await transporter.sendMail(confirmationMailOptions);
      }
    } catch (emailError) {
      console.error("Error sending status update email:", emailError);
      // Continue execution - don't return here
    }

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
    });
  }
};

// Add scheduling functionality
export const scheduleViewing = async (req, res) => {
  try {
    const { propertyId, date, time, notes } = req.body;
    const userId = req.user._id;

    // Check if property exists and is not booked
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check for existing appointments for this time slot
    const existingAppointment = await Appointment.findOne({
      propertyId,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const appointment = new Appointment({
      propertyId,
      userId,
      date,
      time,
      notes,
      status: "pending",
    });

    // Save the appointment first
    await appointment.save();
    await appointment.populate(["propertyId", "userId"]);

    // Send confirmation email
    try {
      const mailOptions = {
        from: `BuildEstate <${process.env.EMAIL}>`,
        to: req.user.email,
        subject: "Viewing Scheduled - BuildEstate",
        html: getSchedulingEmailTemplate(appointment, date, time, notes),
      };

      await transporter.sendMail(mailOptions);

      // Send notification to admin
      const adminMailOptions = {
        from: process.env.EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: "New Viewing Request - BuildEstate",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Viewing Request</h2>
            <p>A new viewing request has been submitted:</p>
            <ul>
              <li>Property: ${appointment.propertyId.title}</li>
              <li>Client: ${req.user.name} (${req.user.email})</li>
              <li>Date: ${new Date(date).toLocaleDateString()}</li>
              <li>Time: ${time}</li>
              ${notes ? `<li>Notes: ${notes}</li>` : ""}
            </ul>
            <p>Please log in to the admin panel to confirm or reject this request.</p>
          </div>
        `,
      };

      await transporter.sendMail(adminMailOptions);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue execution - don't return here
    }

    res.status(201).json({
      success: true,
      message: "Viewing scheduled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error scheduling viewing:", error);
    res.status(500).json({
      success: false,
      message: "Error scheduling viewing",
    });
  }
};

// Add this with other exports
export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate("propertyId", "title")
      .populate("userId", "email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Verify user owns this appointment
    if (appointment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this appointment",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelReason = req.body.reason || "Cancelled by user";
    await appointment.save();

    // Send cancellation email
    const mailOptions = {
      from: process.env.EMAIL,
      to: appointment.userId.email,
      subject: "Appointment Cancelled - BuildEstate",
      html: `
        <div style="max-width: 600px; margin: 20px auto; padding: 30px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb; text-align: center;">Appointment Cancelled</h1>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Your viewing appointment for <strong>${
              appointment.propertyId.title
            }</strong> has been cancelled.</p>
            <p><strong>Date:</strong> ${new Date(
              appointment.date
            ).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            ${
              appointment.cancelReason
                ? `<p><strong>Reason:</strong> ${appointment.cancelReason}</p>`
                : ""
            }
          </div>
          <p style="color: #4b5563;">You can schedule another viewing at any time.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling appointment",
    });
  }
};

// Add this function to get user's appointments
export const getAppointmentsByUser = async (req, res) => {
  try {
    const { filter } = req.query;
    let query = { userId: req.user._id };

    // Apply filtering logic
    if (filter === "upcoming") {
      query = {
        ...query,
        $or: [
          // Pending or confirmed appointments that haven't happened yet
          {
            status: { $in: ["pending", "confirmed"] },
            date: { $gte: new Date() },
          },
          // Confirmed and visited appointments that need payment
          {
            status: "confirmed",
            visited: true,
            "payment.status": { $ne: "paid" },
          },
        ],
      };
    } else if (filter === "past") {
      query = {
        ...query,
        $or: [
          // Completed appointments
          { status: "completed" },
          // Cancelled appointments
          { status: "cancelled" },
          // Past appointments that were paid
          {
            date: { $lt: new Date() },
            "payment.status": "paid",
          },
        ],
      };
    }
    const appointments = await Appointment.find(query)
      .populate("propertyId", "title location image price")
      .sort({ date: 1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
    });
  }
};

export const updateAppointmentMeetingLink = async (req, res) => {
  try {
    const { appointmentId, meetingLink } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { meetingLink },
      { new: true }
    ).populate("propertyId userId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Send email notification with meeting link
    const mailOptions = {
      from: process.env.EMAIL,
      to: appointment.userId.email,
      subject: "Meeting Link Updated - BuildEstate",
      html: `
        <div style="max-width: 600px; margin: 20px auto; font-family: 'Arial', sans-serif; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 40px 20px; border-radius: 15px 15px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Meeting Link Updated</h1>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
            <p>Your viewing appointment for <strong>${
              appointment.propertyId.title
            }</strong> has been updated with a meeting link.</p>
            <p><strong>Date:</strong> ${new Date(
              appointment.date
            ).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meetingLink}" 
                 style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb, #1e40af); 
                        color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Join Meeting
              </a>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Meeting link updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating meeting link:", error);
    res.status(500).json({
      success: false,
      message: "Error updating meeting link",
    });
  }
};

// Add at the end of the file

export const getAppointmentStats = async (req, res) => {
  try {
    const [pending, confirmed, cancelled, completed] = await Promise.all([
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "cancelled" }),
      Appointment.countDocuments({ status: "completed" }),
    ]);

    // Get stats by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        total: pending + confirmed + cancelled + completed,
        pending,
        confirmed,
        cancelled,
        completed,
        dailyStats,
      },
    });
  } catch (error) {
    console.error("Error fetching appointment stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointment statistics",
    });
  }
};

export const submitAppointmentFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit feedback for this appointment",
      });
    }

    appointment.feedback = { rating, comment };
    appointment.status = "completed";
    await appointment.save();

    res.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting feedback",
    });
  }
};

export const getUpcomingAppointments = async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      userId: req.user._id,
      date: { $gte: now },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("propertyId", "title location image")
      .sort({ date: 1, time: 1 })
      .limit(5);

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming appointments",
    });
  }
};

// Add markAppointmentAsVisited function
export const markAppointmentAsVisited = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate("propertyId", "title")
      .populate("userId", "email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Verify user owns this appointment
    if (appointment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment",
      });
    }

    // Only confirmed appointments can be marked as visited
    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed appointments can be marked as visited",
      });
    } // Mark appointment as visited
    appointment.visited = true;
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment marked as visited successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error marking appointment as visited:", error);
    res.status(500).json({
      success: false,
      message: "Error marking appointment as visited",
    });
  }
};
