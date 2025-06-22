import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Home,
  Check,
  X,
  Loader,
  Filter,
  Search,
  Link as LinkIcon,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMeetingLink, setEditingMeetingLink] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to access admin panel", { autoClose: 2000 });
        return;
      }

      const response = await axios.get(`${backendurl}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Filter out appointments with missing or invalid data
        const validAppointments = response.data.appointments.filter(
          (apt) => apt && apt.userId && apt.propertyId && apt.propertyId.title
        );

        if (validAppointments.length < response.data.appointments.length) {
          console.warn("Some appointments have missing or invalid data");
        }

        setAppointments(validAppointments);
      } else {
        toast.error(response.data.message || "Failed to fetch appointments", { autoClose: 2000 });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again", { autoClose: 2000 });
      } else {
        toast.error(
          error.response?.data?.message || "Failed to fetch appointments", { autoClose: 2000 }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await axios.put(
        `${backendurl}/api/appointments/status`,
        {
          appointmentId,
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message, { autoClose: 2000 });
        // Always fetch appointments after successful status update
        await fetchAppointments();
      } else {
        toast.error(
          response.data.message || "Failed to update appointment status", { autoClose: 2000 }
        );
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      // More detailed error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update appointment status";
      toast.error(errorMessage, { autoClose: 2000 });
      // Refresh the list anyway in case the update succeeded but the response failed
      await fetchAppointments();
    }
  };

  const handleMeetingLinkUpdate = async (appointmentId) => {
    try {
      if (!meetingLink) {
        toast.error("Please enter a meeting link", { autoClose: 2000 });
        return;
      }

      const response = await axios.put(
        `${backendurl}/api/appointments/update-meeting`,
        {
          appointmentId,
          meetingLink,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Meeting link sent successfully", { autoClose: 2000 });
        setEditingMeetingLink(null);
        setMeetingLink("");
        fetchAppointments();
      } else {
        toast.error(response.data.message, { autoClose: 2000 });
      }
    } catch (error) {
      console.error("Error updating meeting link:", error);
      toast.error("Failed to update meeting link", { autoClose: 2000 });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);
  const filteredAppointments = appointments.filter((apt) => {
    if (!apt || !apt.propertyId || !apt.userId) return false;

    const matchesSearch =
      searchTerm === "" ||
      (apt.propertyId.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (apt.userId.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (apt.userId.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || apt.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-2 sm:px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header and Search Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Appointments</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage and track property viewing appointments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Appointments</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Meeting Link</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <motion.tr
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    {/* Property Details */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Home className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-xs sm:text-base">
                            {appointment.propertyId?.title || "Property Unavailable"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {appointment.propertyId?.location || "Location not available"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Client Details */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-xs sm:text-base">
                            {appointment.userId?.name || "Unknown"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {appointment.userId?.email || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Date & Time */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-xs sm:text-base">
                            {new Date(appointment.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    {/* Meeting Link */}
                    <td className="px-4 sm:px-6 py-4">
                      {editingMeetingLink === appointment._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="Enter meeting link"
                            className="px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm w-full"
                          />
                          <button
                            onClick={() => handleMeetingLinkUpdate(appointment._id)}
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingMeetingLink(null);
                              setMeetingLink("");
                            }}
                            className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          {appointment.meetingLink ? (
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 text-xs sm:text-sm"
                            >
                              <LinkIcon className="w-4 h-4" />
                              View Link
                            </a>
                          ) : (
                            <span className="text-gray-500 text-xs sm:text-sm">No link yet</span>
                          )}
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={() => {
                                setEditingMeetingLink(appointment._id);
                                setMeetingLink(appointment.meetingLink || "");
                              }}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 sm:px-6 py-4">
                      {appointment.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(appointment._id, "confirmed")}
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment._id, "cancelled")}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs sm:text-base">
              No appointments found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
