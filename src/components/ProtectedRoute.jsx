import React, { useState, useEffect } from "react";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token found in localStorage");
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      try {
        console.log("Verifying token with backend...");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Token verified successfully");
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Token verification failed:", err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, []);

  if (isVerifying) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Verifying authentication...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to frontend login
    const frontend = import.meta.env.VITE_FRONTEND_URL || "";
    const loginUrl = `${frontend.replace(/\/$/, "")}/login`;
    console.log("Redirecting to login:", loginUrl);
    window.location.href = loginUrl;
    return null;
  }

  return children;
};

export default ProtectedRoute;
