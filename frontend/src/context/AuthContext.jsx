import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { Backendurl } from "../App";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("token") ? true : false;
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Set up axios default headers on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (token) {
      try {
        // First verify with the server
        const response = await axios.get(`${Backendurl}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setUser(response.data);
          setIsLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(response.data));
        } else {
          throw new Error("Invalid response");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Only remove auth data if it's an auth error (401)
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);
  const login = async (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsLoggedIn(true);
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
