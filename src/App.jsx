
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, "", "/dashboard");
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const handleFrontendLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = import.meta.env.VITE_FRONTEND_URL || "/";
    };

    window.addEventListener("frontendLogout", handleFrontendLogout);
    return () => window.removeEventListener("frontendLogout", handleFrontendLogout);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to frontend home page
    window.location.href = import.meta.env.VITE_FRONTEND_URL || "/";
  };

  if (!isInitialized) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Home onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
