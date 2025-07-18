import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./components/properties/propertydetail";
import Aboutus from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./components/login";
import Signup from "./components/signup";
import OTPVerification from "./components/OTPVerification";
import ForgotPassword from "./components/forgetpassword";
import ResetPassword from "./components/resetpassword";
import Footer from "./components/footer";
import NotFoundPage from "./components/Notfound";
import { AuthProvider } from "./context/AuthContext";
import AIPropertyHub from "./pages/Aiagent";
import StructuredData from "./components/SEO/StructuredData";
import MyBookings from "./components/dashboard/Appointments";
import Dashboard from "./components/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "./pages/Chatbot";
import FloatingChatbot from "./pages/Chatbot";

export const Backendurl = import.meta.env.VITE_API_BASE_URL;

const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          {/* Base website structured data */}
          <StructuredData type="website" />
          <StructuredData type="organization" />

          <Navbar />
          <FloatingChatbot />
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset/:token" element={<ResetPassword />} />
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route
              path="/properties/single/:id"
              element={<PropertyDetails />}
            />
            <Route path="/about" element={<Aboutus />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/ai-property-hub" element={<AIPropertyHub />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
          <ToastContainer />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
