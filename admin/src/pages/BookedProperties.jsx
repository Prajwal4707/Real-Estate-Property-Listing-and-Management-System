import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  User,
  Loader,
  LockIcon,
  UnlockIcon,
  IndianRupee,
  MapPin,
  Trash2,
} from "lucide-react";
import { backendurl } from "../App";

const BookedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookedProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendurl}/api/bookings/booked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && Array.isArray(response.data.properties)) {
        // Validate and process the properties
        const processedProperties = response.data.properties.map((property) => {
          // Ensure all required fields have default values
          return {
            _id: property._id || "",
            title: property.title || "Untitled Property",
            location: property.location || "Location not specified",
            price: property.price || 0,
            tokenAmount: property.tokenAmount || 0,
            image: Array.isArray(property.image) ? property.image : [],
            bookedBy: property.bookedBy || null,
            bookingDate: property.bookingDate || null,
            paymentStatus: property.paymentStatus || "pending",
            isBlocked: property.isBlocked || false,
          };
        });

        setProperties(processedProperties);
      } else {
        console.error("Invalid response format:", response.data);
        setError("Invalid data received from server");
        toast.error("Failed to load properties correctly");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError(error.message);
      toast.error(
        error.response?.data?.message || "Failed to load booked properties"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      console.log(
        "Attempting to verify payment for appointmentId:",
        appointmentId
      );
      const url = `${backendurl}/api/bookings/verify-payment/${appointmentId}`;
      console.log("Sending PUT request to URL:", url);

      const response = await axios.put(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Payment verified successfully");
        fetchBookedProperties();
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Failed to verify payment");
    }
  };

  const handleBlockProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${backendurl}/api/properties/${propertyId}/block`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Property blocked successfully");
        fetchBookedProperties();
      }
    } catch (error) {
      toast.error("Failed to block property");
    }
  };

  const handleUnblockProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${backendurl}/api/properties/${propertyId}/unblock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Property unblocked successfully");
        fetchBookedProperties();
      }
    } catch (error) {
      toast.error("Failed to unblock property");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      const response = await axios.delete(
        `${backendurl}/api/bookings/${propertyId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Property booking cancelled successfully");
        fetchBookedProperties();
      }
    } catch (error) {
      console.error("Error cancelling property booking:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel property booking"
      );
    }
  };

  useEffect(() => {
    fetchBookedProperties();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    // Convert the amount to a number if it's not already
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    // Use the default amount if the value is not a valid number
    const validAmount = !isNaN(numericAmount) ? numericAmount : 0;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(validAmount);
  };

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Booked Properties</h1>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      ) : properties.length === 0 ? (
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
              className="bg-white rounded-lg shadow-lg overflow-hidden relative"
            >
              <button
                onClick={() => handleDeleteProperty(property._id)}
                className="absolute top-2 right-2 p-2 bg-white text-red-600 rounded-full hover:bg-gray-100 transition-colors z-10"
                title="Delete Property"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <img
                src={property.image?.[0] || "/placeholder-property.jpg"}
                alt={property.title || "Property Image"}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-property.jpg";
                }}
              />
              <div className="p-4 space-y-4">
                <h3 className="text-xl font-semibold">{property.title}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{property.location}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    <span>Price: {formatCurrency(property.price)}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    <span>
                      Token Amount:{" "}
                      {property.tokenAmount ? (
                        formatCurrency(property.tokenAmount)
                      ) : (
                        <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs">
                          Amount pending
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>
                      Booked by:{" "}
                      {property.bookedBy ? (
                        <span className="font-medium text-blue-600">
                          {property.bookedBy.name ||
                            property.bookedBy.email ||
                            "Unknown User"}
                        </span>
                      ) : (
                        <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs">
                          Booking details pending
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Booked on:{" "}
                      {property.bookingDate ? (
                        formatDate(property.bookingDate)
                      ) : (
                        <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs">
                          Booking date pending
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        property.paymentStatus === "verified"
                          ? "bg-green-100 text-green-800"
                          : property.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      Payment Status: {property.paymentStatus || "pending"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {!property.paymentStatus ||
                  property.paymentStatus !== "verified" ? (
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to verify this payment?"
                          )
                        ) {
                          await handleVerifyPayment(property._id);
                        }
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                    >
                      Verify Payment
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlockProperty(property._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center"
                    >
                      <LockIcon className="w-4 h-4 mr-1" /> Block
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookedProperties;
