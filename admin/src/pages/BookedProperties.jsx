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

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const fetchBookedProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendurl}/api/bookings/booked`);

      if (response.data.success && Array.isArray(response.data.properties)) {
        // Create a Map to store unique properties by their ID
        const uniqueProperties = new Map();
        
        // Process and deduplicate properties
        response.data.properties.forEach((property) => {
          if (property._id) {
            console.log("Raw tokenAmount for property", property._id, ":", property.tokenAmount); // Debug log
            uniqueProperties.set(property._id, {
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
            });
          }
        });

        // Convert Map values back to array
        setProperties(Array.from(uniqueProperties.values()));
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

  const handleVerifyPayment = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      console.log(
        "Attempting to verify payment for propertyId:",
        propertyId
      );
      const url = `${backendurl}/api/properties/${propertyId}/verify-payment`;
      console.log("Sending PUT request to URL:", url);

      const response = await axios.put(url, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
      });

      if (response.data.success) {
        toast.success("Payment verified successfully");
        fetchBookedProperties();
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error(error.response?.data?.message || "Failed to verify payment");
    }
  };

  const handleBlockProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      if (!window.confirm("Are you sure you want to block this property?")) {
        return;
      }

      console.log("Attempting to block property:", propertyId);
      const response = await axios.put(
        `${backendurl}/api/property/${propertyId}/block`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Property blocked successfully");
        // Update the specific property in the state
        setProperties(prevProperties => 
          prevProperties.map(property => 
            property._id === propertyId 
              ? { ...property, isBlocked: true }
              : property
          )
        );
      } else {
        toast.error(response.data.message || "Failed to block property");
      }
    } catch (error) {
      console.error("Error blocking property:", error);
      toast.error(error.response?.data?.message || "Failed to block property");
    }
  };

  const handleUnblockProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      if (!window.confirm("Are you sure you want to unblock this property?")) {
        return;
      }

      console.log("Attempting to unblock property:", propertyId);
      const response = await axios.put(
        `${backendurl}/api/property/${propertyId}/unblock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Property unblocked successfully");
        // Update the specific property in the state
        setProperties(prevProperties => 
          prevProperties.map(property => 
            property._id === propertyId 
              ? { ...property, isBlocked: false }
              : property
          )
        );
      } else {
        toast.error(response.data.message || "Failed to unblock property");
      }
    } catch (error) {
      console.error("Error unblocking property:", error);
      toast.error(error.response?.data?.message || "Failed to unblock property");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login again.");
        return;
      }

      if (!window.confirm("Are you sure you want to remove this property from booked list?")) {
        return;
      }

      console.log("Attempting to remove property from booked list:", propertyId);
      const response = await axios.delete(
        `${backendurl}/api/bookings/${propertyId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Property removed from booked list successfully");
        // Remove only the specific property from the state
        setProperties(prevProperties => 
          prevProperties.filter(property => property._id !== propertyId)
        );
      } else {
        toast.error(response.data.message || "Failed to remove property from booked list");
      }
    } catch (error) {
      console.error("Error removing property from booked list:", error);
      toast.error(error.response?.data?.message || "Failed to remove property from booked list");
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
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // Use the default amount if the value is not a valid number
    const validAmount = !isNaN(numericAmount) ? numericAmount : 0;

    // Format the number with Indian currency format
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(validAmount);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 pt-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Booked Properties</h2>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded text-sm sm:text-base">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8 min-h-screen">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-sm sm:text-base">No booked properties found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden relative flex flex-col"
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
                className="w-full h-40 sm:h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-property.jpg";
                }}
              />
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between">
                <h3 className="text-lg sm:text-xl font-semibold">{property.title}</h3>

                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
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
                      Token Amount: {property.tokenAmount ? (
                        <span className="font-medium">
                          ₹{(Number(property.tokenAmount) / 100).toLocaleString('en-IN')}
                        </span>
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
                      Booked by: {property.bookedBy ? (
                        <span className="font-medium text-blue-600">
                          {property.bookedBy.name || property.bookedBy.email || "Unknown User"}
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
                      Booked on: {property.bookingDate ? (
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

                <div className="flex gap-2 mt-3 sm:mt-4 flex-wrap">
                  {property.isBlocked ? (
                    <button
                      onClick={() => handleUnblockProperty(property._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm flex items-center"
                    >
                      <UnlockIcon className="w-4 h-4 mr-1" /> Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlockProperty(property._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm flex items-center"
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
