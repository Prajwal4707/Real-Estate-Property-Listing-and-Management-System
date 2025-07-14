import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw, Key } from 'lucide-react';
import { Backendurl } from '../App';
import { toast } from 'react-toastify';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'error'

  // Get email from URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
    
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      localStorage.setItem('pendingVerificationEmail', emailFromUrl);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    }
  }, []);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${Backendurl}/api/users/verify-otp`, {
        email,
        otp: otpString
      });
      
      if (response.data.success) {
        setVerificationStatus('success');
        localStorage.removeItem('pendingVerificationEmail');
        toast.success('Email verified successfully! You can now log in.');
      } else {
        setVerificationStatus('error');
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const response = await axios.post(`${Backendurl}/api/users/resend-otp`, { email });
      
      if (response.data.success) {
        toast.success('Verification code sent successfully! Check your inbox.');
        setOtp(['', '', '', '', '', '']); // Clear OTP input
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

  const renderContent = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been verified. You can now log in to your account and access all features.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Log In to Your Account
              </Link>
              <Link
                to="/"
                className="inline-block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              The verification code is invalid or has expired. Please try again or request a new code.
            </p>
            <button
              onClick={() => setVerificationStatus('pending')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium mb-3"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="inline-block w-full text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Homepage
            </Link>
          </div>
        );

      default:
        return (
          <div>
            <div className="text-center mb-8">
              <Key className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Verify Your Email</h2>
              <p className="text-gray-600">
                Enter the 6-digit verification code sent to your email
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="•"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verify Email</span>
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-4 h-4 inline mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 inline mr-1" />
                      Resend Code
                    </>
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center pt-4 border-t border-gray-200">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        );
    }
  };

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

          {/* Content */}
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification; 