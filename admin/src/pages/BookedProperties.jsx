import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Home, Calendar, User, Loader, XCircle } from "lucide-react";
import { backendurl } from "../App";

const BookedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchBookedProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      console.log(
        "Fetching booked properties from:",
        `${backendurl}/api/bookings/booked`
      );
      const response = await axios.get(`${backendurl}/api/bookings/booked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        console.log("Received properties:", response.data.properties);
        setProperties(response.data.properties);
      } else {
        console.error("API returned success: false");
        toast.error(
          response.data.message || "Failed to load booked properties"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching booked properties:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to load booked properties"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedProperties();
  }, []);

  const handleCancelBooking = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${backendurl}/api/bookings/${propertyId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Booking cancelled successfully");
        fetchBookedProperties();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Booked Properties</h1>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No booked properties found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={property.image[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{property.title}</h2>
                <p className="text-gray-600 mb-4">{property.location}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>
                      Booked by: {property.bookedBy?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Booked on:{" "}
                      {new Date(property.bookingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Home className="w-4 h-4 mr-2" />
                    <span>Price: ${property.price.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCancelBooking(property._id)}
                  className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 
                    transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Booking
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookedProperties;
