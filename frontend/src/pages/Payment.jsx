import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Calendar, User, Lock, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { Backendurl } from "../App";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    if (!location.state?.appointmentId) {
      navigate("/dashboard/appointments");
      return;
    }
    fetchAppointmentDetails(location.state.appointmentId);
  }, [location.state, navigate]);

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${Backendurl}/api/appointments/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const appointmentData = response.data.appointments.find(
          (apt) => apt._id === appointmentId
        );
        if (appointmentData) {
          setAppointment(appointmentData);
        } else {
          toast.error("Appointment not found");
          navigate("/dashboard/appointments");
        }
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast.error("Error loading appointment details");
      navigate("/dashboard/appointments");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces every 4 digits
    if (name === "cardNumber") {
      formattedValue =
        value
          .replace(/\s/g, "")
          .match(/.{1,4}/g)
          ?.join(" ") || "";
      if (formattedValue.length > 19) return; // 16 digits + 3 spaces
    }

    // Format expiry date
    if (name === "expiry") {
      formattedValue =
        value
          .replace(/\D/g, "")
          .match(/.{1,2}/g)
          ?.join("/") || "";
      if (formattedValue.length > 5) return; // MM/YY
    }

    // Limit CVV to 3 or 4 digits
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 4) return;
    }

    setCardDetails((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${Backendurl}/api/appointments/payment`,
        {
          appointmentId: appointment._id,
          amount: 1000, // Fixed token amount of ₹1000
          paymentDetails: {
            // In a real app, you would securely handle these details
            last4: cardDetails.cardNumber.slice(-4),
            paymentMethod: "card",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Payment processed successfully");
        navigate("/dashboard/appointments");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 pb-12 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white py-4 px-6">
            <h1 className="text-2xl font-bold">Payment Details</h1>
          </div>

          <div className="p-6">
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Appointment Summary
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Property:</span>{" "}
                  {appointment.propertyId.title}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(appointment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Time:</span> {appointment.time}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Amount:</span>{" "}
                  <span className="text-lg font-semibold text-blue-600">
                    ₹1,000
                  </span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="expiry"
                      value={cardDetails.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/appointments")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Pay ₹1,000
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
