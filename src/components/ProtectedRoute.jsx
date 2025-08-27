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
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          { withCredentials: true } // send cookies
        );

        if (data.user) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <Loader />; // Or a spinner
  }

  if (!isAuthenticated) {
    // Redirect to landing page project
    window.location.href = import.meta.env.VITE_LANDING_PAGE_URL;
    return null; // stop rendering anything else
  }


  return children; // User is authenticated, render the dashboard
};

export default ProtectedRoute;
