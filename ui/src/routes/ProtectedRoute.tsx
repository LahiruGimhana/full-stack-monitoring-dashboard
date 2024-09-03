/* eslint-disable prefer-const */
import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, Navigate } from "react-router-dom";
import authClient from "../services/authService";
import Sidebar from "../components/Sidebar";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let interval;
    let timeout;

    const checkAuthToken = async () => {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        setIsAuthenticated(false);
        logout();
      } else {
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 1000; // 1 second (adjust as needed)

        try {
          const response = await authClient.get("auth/validate", authToken);
          if (response.status !== 200) {
            setIsAuthenticated(false);
            logout();
          } else {
            clearTimeout(timeout); // Clear the timeout if response received successfully
            setRetrying(false);
          }
        } catch (error) {
          const retry = async () => {
            retryCount++;
            if (retryCount >= maxRetries) {
              setIsAuthenticated(false);
              logout();
              return;
            }

            try {
              const response = await authClient.get("auth/validate", authToken);
              if (response.status === 200) {
                clearTimeout(timeout); // Clear the timeout if response received successfully
                setRetrying(false); // Hide retrying message and spinner
                retryCount = 0;
              }
            } catch (error) {
              console.log(`Retry attempt ${retryCount} failed. Retrying...`);
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              await retry(); // Retry the request
            }
          };
          setRetrying(true); // Show retrying message and spinner
          await retry();
        }
      }
    };

    checkAuthToken(); // Check the token immediately on mount
    interval = setInterval(checkAuthToken, 60 * 1000); // Check the token every minute

    // Timeout mechanism
    timeout = setTimeout(() => {
      setIsAuthenticated(false);
      logout();
    }, 3 * 60 * 1000); // 3 minutes

    // Clear both interval and timeout on unmount
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("appData");
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated && !sessionStorage.getItem("authToken")) {
    return <Navigate to="/login" replace />; // Redirect to login on unauthorized access
  }

  return (
    <div className="relative overflow-auto  xl:overflow-hidden">
      {retrying && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="text-white flex items-center">
            <div className="w-12 h-12 mr-2 rounded-full animate-spin border-4 border-solid border-blue-500 border-t-transparent"></div>
            <p>Connecting to the Server...</p>
          </div>
        </div>
      )}
      {isAuthenticated || sessionStorage.getItem("authToken") ? (
        <div className="flex">
          <Sidebar />
          <div
            className="main-content"
            style={{ width: "96%", height: "100vh" }}
          >
            <Outlet />
          </div>
        </div>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
};

export default ProtectedRoute;
