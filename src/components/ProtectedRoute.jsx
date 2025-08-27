// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Checking authentication...");

      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`;
        console.log("➡️ Sending request to:", url);

        const { data } = await axios.get(url, {
          withCredentials: true, // send cookies
        });

        console.log("✅ Auth response:", data);

        if (data.user) {
          console.log("🎉 User authenticated:", data.user);
          setIsAuthenticated(true);
        } else {
          console.log("⚠️ No user object found in response.");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("❌ Auth check failed:", err.message || err);
        setIsAuthenticated(false);
      } finally {
        console.log("⏳ Finished auth check");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    console.log("⏳ Still loading...");
    return <Loader />; // Or a spinner
  }

  if (!isAuthenticated) {
    console.warn("🚨 User not authenticated. Redirect/return null.");
    // window.location.href = import.meta.env.VITE_LANDING_PAGE_URL;
    return null; // stop rendering anything else
  }

  console.log("✅ User authenticated. Rendering children...");
  return children; // User is authenticated, render the dashboard
};

export default ProtectedRoute;
