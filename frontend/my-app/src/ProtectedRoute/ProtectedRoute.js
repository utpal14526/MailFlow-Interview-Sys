import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isVerified, setIsVerified] = useState(null);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsVerified(false);
        return;
      }

      try {
        const res = await axios.post(
          `${BASE_URL}/api/auth/verify-user`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsVerified(res.data.success);
      } catch (err) {
        setIsVerified(false);
      }
    };

    verifyUser();
  }, [BASE_URL]);

  if (isVerified === null) {
    return <p>Loading...</p>;
  }

  return isVerified ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
