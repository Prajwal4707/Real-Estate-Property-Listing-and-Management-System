import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BedDouble,
  Bath,
  Maximize,
  ArrowLeft,
  Phone,
  Calendar,
  MapPin,
  Loader,
  Building,
  Share2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Compass,
} from "lucide-react";
import { Backendurl } from "../../App.jsx";
import ScheduleViewing from "./ScheduleViewing";

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();
  const fetched = useRef(false);

  useEffect(() => {
    const fetchProperty = async () => {
      // Reset fetched flag if navigation is from chatbot
      if (location.state?.fromChatbot) {
        fetched.current = false;
      }
      
      if (fetched.current) return;
      fetched.current = true;
      try {
        setLoading(true);
        const response = await axios.get(
          `${Backendurl}/api/products/single/${id}`
        );

        if (response.data.success) {
          const propertyData = response.data.property;
          setProperty({
            ...propertyData,
            amenities: parseAmenities(propertyData.amenities),
          });
          setError(null);
        } else {
          setError(response.data.message || "Failed to load property details.");
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, location.state?.fromChatbot]);

  useEffect(() => {
    // Reset scroll position and active image when component mounts
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [id]);

  const parseAmenities = (amenities) => {
    if (!amenities) return [];

    try {
      // If it's already an array, return it
      if (Array.isArray(amenities)) {
        return amenities;
      }

      // If amenities is a string
      if (typeof amenities === "string") {
        // Try parsing as JSON if it looks like an array
        if (amenities.trim().startsWith("[")) {
          return JSON.parse(amenities);
        }
        // If it's a comma-separated string
        if (amenities.includes(",")) {
          return amenities.split(",").map((item) => item.trim());
        }
        // Single amenity
        return [amenities];
      }

      console.log("Unknown amenities data structure:", amenities);
      return [];
    } catch (error) {
      console.error("Error parsing amenities:", error);
      console.log("Original amenities data:", amenities);
      return [];
    }
  };

  const handleKeyNavigation = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        setActiveImage((prev) =>
          prev === 0 ? property.image.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setActiveImage((prev) =>
          prev === property.image.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === "Escape" && showSchedule) {
        setShowSchedule(false);
      }
    },
    [property?.image?.length, showSchedule]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNavigation);
    return () => window.removeEventListener("keydown", handleKeyNavigation);
  }, [handleKeyNavigation]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this ${property.type}: ${property.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Helper function to format price/rent display
  const formatPriceDisplay = (property) => {
    if (property?.isRental && property?.rentAmount) {
      return {
        label: "Monthly Rent",
        amount: property.rentAmount,
        suffix: "/month",
        additionalInfo: `Security Deposit: ₹${property.securityDeposit?.toLocaleString("en-IN")}`
      };
    } else {
      // For sale properties, parse the price string and format it
      const priceNumber = parseInt(property?.price) || 0;
      return {
        label: "Price",
        amount: priceNumber,
        suffix: "",
        additionalInfo: ""
      };
    }
  };

  const priceInfo = formatPriceDisplay(property);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Main Content Skeleton */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Image Gallery Skeleton */}
            <div className="relative h-[500px] bg-gray-200 rounded-xl mb-8 animate-pulse">
              {/* Image Navigation Buttons */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-full"></div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-full"></div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-black/20 rounded-full"></div>
            </div>

            {/* Content Skeleton */}
            <div className="p-8">
              {/* Title and Location */}
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3 w-full max-w-md">
                  <div className="h-10 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Price Box */}
                  <div className="h-28 bg-blue-50/50 rounded-lg animate-pulse"></div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-gray-100 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                  </div>

                  {/* Button */}
                  <div className="h-12 bg-blue-200 rounded-lg animate-pulse"></div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse mt-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-6 bg-gray-200 rounded-lg animate-pulse"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Location Skeleton */}
          <div className="mt-8 p-6 bg-blue-50/50 rounded-xl animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
              <div className="h-7 bg-gray-300 rounded-lg w-1/6"></div>
            </div>
            <div className="h-5 bg-gray-300 rounded-lg w-4/5 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded-lg w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link
            to="/properties"
            className="text-blue-600 hover:underline flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-16 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link
            to="/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Properties
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              hover:bg-gray-100 transition-colors relative"
          >
            {copySuccess ? (
              <span className="text-green-600">
                <Copy className="w-5 h-5" />
                Copied!
              </span>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Share
              </>
            )}
          </button>
        </nav>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-[500px] bg-gray-100 rounded-xl overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={property.image[activeImage]}
                alt={`${property.title} - View ${activeImage + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              />
            </AnimatePresence>

            {/* Image Navigation */}
            {property.image.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImage((prev) =>
                      prev === 0 ? property.image.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setActiveImage((prev) =>
                      prev === property.image.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 
              bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm"
            >
              {activeImage + 1} / {property.image.length}
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  {property.location}
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {priceInfo.label}: ₹{Number(priceInfo.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-gray-600">
                    {priceInfo.additionalInfo}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <BedDouble className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {property.beds} {property.beds > 1 ? "Beds" : "Bed"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {property.baths} {property.baths > 1 ? "Baths" : "Bath"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Maximize className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {property.sqft} sqft
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Contact Details
                  </h2>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-2" />
                    {property.phone}
                  </div>
                </div>

                <button
                  onClick={() => setShowSchedule(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg 
                  transition-colors flex items-center 
                  justify-center gap-2"
                >
                  {" "}
                  <Calendar className="w-5 h-5" />
                  Schedule Viewing
                </button>
              </div>

              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center text-gray-600"
                      >
                        <Building className="w-4 h-4 mr-2 text-blue-600" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Property Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Property Features
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-gray-600">
                <BedDouble className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-sm">
                  {property.beds} Bed{property.beds > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Bath className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-sm">
                  {property.baths} Bath{property.baths > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Maximize className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-sm">{property.sqft} sqft</span>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Amenities Section */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Property Amenities</h2>
            <div className="grid grid-cols-2 gap-4">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center text-gray-600">
                  <Building className="w-4 h-4 mr-2 text-blue-600" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Add Map Location */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Compass className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Location</h3>
          </div>
          <p className="text-gray-600 mb-4">{property.location}</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              property.location
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <MapPin className="w-4 h-4" />
            View on Google Maps
          </a>
        </div>
        {/* Viewing Modal */}
        <AnimatePresence>
          {showSchedule && (
            <ScheduleViewing
              propertyId={property._id}
              onClose={() => setShowSchedule(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PropertyDetails;
