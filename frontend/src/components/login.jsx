import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { Loader, Mail, AlertCircle } from "lucide-react";
import { Backendurl } from "../App";
import { authStyles } from "../styles/auth";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${Backendurl}/api/users/login`,
        formData
      );
      if (response.data.success) {
        await login(response.data.token, response.data.user);
        toast.success("Login successful!", { autoClose: 2000 });
        navigate("/");
      } else {
        if (response.data.needsVerification) {
          setNeedsVerification(true);
          setUserEmail(formData.email);
          toast.error(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.response?.data?.needsVerification) {
        setNeedsVerification(true);
        setUserEmail(formData.email);
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userEmail) return;
    
    setResending(true);
    try {
      const response = await axios.post(`${Backendurl}/api/users/resend-otp`, { email: userEmail });
      if (response.data.success) {
        toast.success('Verification code sent successfully! Check your inbox.');
        // Redirect to OTP verification page
        navigate(`/verify-otp?email=${encodeURIComponent(userEmail)}`);
      } else {
        toast.error(response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  BuildEstate
                </h2>
              </Link>
            </div>

            {/* Verification Required Content */}
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Email Verification Required</h2>
              <p className="text-gray-600 mb-6">
                Your email address <strong className="text-blue-600">{userEmail}</strong> needs to be verified before you can log in.
              </p>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-orange-800 mb-2">📧 Check Your Email</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Look for an email from BuildEstate</li>
                  <li>• Check your spam folder if you don't see it</li>
                  <li>• Enter the 6-digit verification code</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {resending ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin inline mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 inline mr-2" />
                      Send Verification Code
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setNeedsVerification(false)}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Back to Login
                </button>
                
                <Link
                  to="/signup"
                  className="inline-block w-full text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mt-14">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BuildEstate
              </h2>
            </Link>
            <h2 className="mt-6 text-2xl font-semibold text-gray-800">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-600">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="name@company.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                "Sign in"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              to="/signup"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Create an account
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
