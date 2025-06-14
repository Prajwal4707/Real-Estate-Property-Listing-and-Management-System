import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Home,
  ExternalLink,
  X,
  MapPin,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { Backendurl } from "../../App";

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    fetchAppointments();
  }, []);
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view appointments");
        navigate("/login");
        return;
      }

      const response = await axios.get(`${Backendurl}/api/appointments/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Filter out appointments with missing or invalid data
        const validAppointments = response.data.appointments.filter(
          (apt) => apt && apt.propertyId && apt.propertyId.title
        );

        if (validAppointments.length < response.data.appointments.length) {
          console.warn("Some appointments have missing or invalid data");
        }

        setAppointments(validAppointments);
      } else {
        toast.error(response.data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Error fetching appointments"
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleMeetingJoin = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${Backendurl}/api/appointments/status`,
        {
          appointmentId,
          status: "completed",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Silently update the status - no need to show a message
      fetchAppointments();
    } catch (error) {
      console.error("Error updating meeting status:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${Backendurl}/api/appointments/cancel/${appointmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Appointment cancelled successfully");
        fetchAppointments();
      } else {
        toast.error(response.data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };
  const handleMarkAsVisited = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${Backendurl}/api/appointments/mark-visited`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Appointment marked as visited.");
        fetchAppointments();
      } else {
        toast.error(response.data.message || "Failed to mark as visited");
      }
    } catch (error) {
      console.error("Error marking appointment as visited:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark appointment as visited";
      toast.error(errorMessage);
      await fetchAppointments(); // Still refresh to ensure UI is in sync with backend
    }
  };
  const handleTokenPayment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const appointment = appointments.find((apt) => apt._id === appointmentId);
      if (!appointment) {
        toast.error("Appointment not found");
        return;
      }

      // Proceed with creating order if property is not booked
      const orderResponse = await axios.post(
        `${Backendurl}/api/appointments/payment/create-order`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || "Could not create order");
      }

      // Configure Razorpay options
      const options = {
        key: "rzp_test_meL58e1NfBNqxd", // Your Razorpay Key ID
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: "BuildEstate",
        description: "Property Visit Token Payment",
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${Backendurl}/api/appointments/payment/verify-payment`,
              {
                appointmentId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful!");
              fetchAppointments();
            } else {
              toast.error(
                verifyResponse.data.message || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error(
              error.response?.data?.message || "Payment verification failed"
            );
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },
        theme: {
          color: "#16a34a",
        },
      };

      // Initialize Razorpay
      const rzp1 = new window.Razorpay(options);
      rzp1.open();

      // Handle payment failure
      rzp1.on("payment.failed", function (response) {
        toast.error("Payment failed! " + response.error.description);
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error(
        error.response?.data?.message || "Could not initiate payment"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const filteredAppointments = appointments.filter((appointment) => {
    // First check if the appointment is valid
    if (
      !appointment ||
      !appointment.propertyId ||
      !appointment.date ||
      !appointment.status
    ) {
      return false;
    }

    const now = new Date();
    if (filter === "upcoming") {
      return (
        // Pending or confirmed appointments in the future
        (["pending", "confirmed"].includes(appointment.status) &&
          new Date(appointment.date) >= now) || // Past completed appointments
        (appointment.status === "confirmed" && appointment.visited)
      );
    } else if (filter === "past") {
      return (
        // Cancelled appointments
        appointment.status === "cancelled" ||
        // Completed appointments
        appointment.status === "completed" ||
        // Past appointments not visited yet
        (new Date(appointment.date) < now && !appointment.visited)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600">
            Track your property viewing appointments
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="upcoming">Upcoming Appointments</option>
              <option value="past">Past Appointments</option>
            </select>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "upcoming"
                ? "You don't have any upcoming appointments"
                : "You don't have any past appointments"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Home className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        {" "}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.propertyId?.title ||
                            "Property Unavailable"}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {appointment.propertyId?.location ||
                            "Location not available"}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  {appointment.meetingLink &&
                    appointment.status === "confirmed" && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-800">
                            Meeting link available
                          </span>
                          <a
                            href={
                              appointment.meetingLink.startsWith("http")
                                ? appointment.meetingLink
                                : `https://${appointment.meetingLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              const url = appointment.meetingLink;
                              if (!url) {
                                e.preventDefault();
                                toast.error("Invalid meeting link");
                                return;
                              }

                              // Determine platform and handle accordingly
                              if (url.includes("zoom.us")) {
                                // Zoom meetings should start with https://zoom.us/j/
                                if (!url.includes("zoom.us/j/")) {
                                  e.preventDefault();
                                  window.open(
                                    `https://zoom.us/j/${url.split("/").pop()}`,
                                    "_blank"
                                  );
                                }
                              } else if (url.includes("meet.google.com")) {
                                // Google Meet links should start with https://meet.google.com/
                                if (!url.includes("https://")) {
                                  e.preventDefault();
                                  window.open(
                                    `https://meet.google.com/${url
                                      .split("/")
                                      .pop()}`,
                                    "_blank"
                                  );
                                }
                              } else if (url.includes("teams.microsoft.com")) {
                                // Teams links should start with https://teams.microsoft.com/
                                if (!url.includes("https://")) {
                                  e.preventDefault();
                                  window.open(
                                    `https://teams.microsoft.com/l/meetup-join/${url
                                      .split("/")
                                      .pop()}`,
                                    "_blank"
                                  );
                                }
                              }

                              // After meeting link is opened, update the status
                              handleMeetingJoin(appointment._id);
                            }}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <span className="text-sm font-medium">
                              Join Meeting
                            </span>
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </a>
                        </div>
                      </div>
                    )}{" "}
                  <div className="flex justify-end space-x-3">
                    {" "}
                    {/* Show Mark as Visited button for confirmed but unvisited appointments */}
                    {appointment.status === "confirmed" &&
                      !appointment.visited && (
                        <button
                          onClick={() => handleMarkAsVisited(appointment._id)}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Mark as Visited
                        </button>
                      )}{" "}
                    {/* Show Pay Token button for visited appointments */}
                    {appointment.status === "confirmed" &&
                      appointment.visited &&
                      (!appointment.payment ||
                        appointment.payment?.status !== "completed") && (
                        <div className="flex flex-col items-end gap-2">
                          {" "}
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Property Price: ₹
                              {formatCurrency(
                                Number(appointment.propertyId.price) || 0
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              Token Amount (5%): ₹
                              {formatCurrency(
                                Math.min(
                                  Number(appointment.propertyId.price || 0) *
                                    0.05,
                                  500000
                                )
                              )}
                              {Number(appointment.propertyId.price || 0) *
                                0.05 >
                                500000 && (
                                <span className="text-xs text-orange-600 ml-1">
                                  (capped at ₹5,00,000 for testing)
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleTokenPayment(appointment._id)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Pay Token Amount
                          </button>
                        </div>
                      )}
                    {/* Show payment completed status */}{" "}
                    {appointment.status === "confirmed" &&
                      appointment.visited &&
                      appointment.payment?.status === "completed" && (
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Payment Status:{" "}
                              <span className="text-green-600 font-medium">
                                Successful
                              </span>
                            </p>{" "}
                            <p className="text-sm text-gray-600">
                              Amount Paid: ₹
                              {formatCurrency(
                                Number(appointment.payment?.amount || 0) / 100
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Paid on:{" "}
                              {new Date(
                                appointment.payment.paidAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-green-700 bg-green-50 border border-green-200 shadow-sm">
                            <Check className="w-5 h-5 mr-2 text-green-500" />
                            Payment Verified
                          </div>
                        </div>
                      )}
                    {appointment.status === "pending" && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>{" "}
      {/* Payment form will be added later */}
    </div>
  );
};

export default Appointments;
