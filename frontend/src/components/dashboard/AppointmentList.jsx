import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { Backendurl } from "../../App";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view appointments");
        return;
      }

      setLoading(true);
      const response = await axios.get(
        `${Backendurl}/api/appointments/user?filter=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    } finally {
      setLoading(false);
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
        toast.success("Appointment marked as visited",{autoClose:2000});
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error marking appointment as visited:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark appointment as visited",{autoClose:2000}
      );
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      // For demo purposes, using a fixed token amount
      const response = await axios.put(
        `${Backendurl}/api/appointments/payment`,
        { appointmentId, amount: 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Payment processed successfully");
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.response?.data?.message || "Failed to process payment");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {filter} appointments found
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow-sm p-6 space-y-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">
                  {appointment.propertyId.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${
                    appointment.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {appointment.status.charAt(0).toUpperCase() +
                    appointment.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(appointment.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{appointment.propertyId.location}</span>
                </div>
              </div>

              {/* Show actions based on appointment state */}
              {appointment.status === "confirmed" && !appointment.visited && (
                <button
                  onClick={() => handleMarkAsVisited(appointment._id)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Visited
                </button>
              )}

              {appointment.status === "confirmed" &&
                appointment.visited &&
                (!appointment.payment ||
                  appointment.payment.status !== "paid") && (
                  <button
                    onClick={() => handlePayment(appointment._id)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <IndianRupee className="w-4 h-4" />
                    Pay Token Amount
                  </button>
                )}

              {appointment.meetingLink && (
                <a
                  href={appointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <AlertCircle className="w-4 h-4" />
                  View Meeting Link
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
