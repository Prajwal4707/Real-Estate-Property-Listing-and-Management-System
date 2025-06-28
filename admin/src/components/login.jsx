import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Change the endpoint to /api/users/admin for admin login
      const response = await axios.post(`${backendUrl}/api/users/admin`, {
        email,
        password,
      });

      if (response.data.success) {
        // Clear any existing tokens first
        localStorage.clear();

        // Store the admin token and related data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userId", response.data.user._id);

        // Set default authorization header for all future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;

        toast.success("Admin login successful!", { autoClose: 2000 });
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed", { autoClose: 2000 });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Invalid admin credentials", { autoClose: 2000 });
      // Clear any invalid tokens
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-2">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow p-6 sm:p-8 mx-auto my-8 sm:my-16 dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white text-center">
            Admin Login
          </h1>

          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 text-base sm:text-sm"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 text-base sm:text-sm"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-base sm:text-sm px-5 py-2.5 text-center"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
