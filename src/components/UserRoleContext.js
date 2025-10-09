import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScreenLoad from "./screenLoad";

const UserContext = createContext(null);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  const loadingTimeout = useRef(null);
  const retryTimeout = useRef(null);
  const isMounted = useRef(true);

  // ✅ Unified fetch with retry logic
  const fetchUserData = useCallback(async (userId, retryCount = 0) => {
    if (!userId) return;
    setIsLoading(true);

    try {
      // timeout for network lag
      loadingTimeout.current = setTimeout(() => {
        if (isMounted.current) {
          setIsLoading(false);
          toast.error("Check your internet connection and refresh the page.", {
            className: "custom-toast",
          });
        }
      }, 15000);

      const response = await fetch(
        `https://broker-app-4xfu.onrender.com/api/userDetail/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (isMounted.current) {
        setUserData({
          avatar: data.avatar,
          email: data.email,
          fullName: data.name,
          userID: data.userId,
          agentID: data.agentID,
          agentCode: data.agentCode,
          phoneNo: data.number,
          role: data.role,
          isUserActive: data.isUserActive,
          hasPaid: data.hasPaid,
          deposit: data.deposit,
          profit: data.profit,
          totalWithdrawn: data.totalWithdrawn,
          lastPlan: data.lastPlan,
          currencySymbol: data.currencySymbol,
          country: data.country,
          referralsBalance: data.referralsBalance,
          referredUsers: data.referredUsers,
          referralCode: data.referralCode,
        });
      }

      clearTimeout(loadingTimeout.current);
    } catch (error) {
      console.error("Error fetching user data:", error);

      // ✅ Retry with exponential backoff (up to 5 retries)
      if (retryCount < 5 && isMounted.current) {
        const delay = Math.min(5000 * (retryCount + 1), 30000);
        console.warn(`Retrying fetch in ${delay / 1000}s...`);

        retryTimeout.current = setTimeout(() => {
          fetchUserData(userId, retryCount + 1);
        }, delay);
      } else if (isMounted.current) {
        toast.error("Failed to load user data after several attempts.", {
          className: "custom-toast",
        });
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  // ✅ Auth listener
  useEffect(() => {
    isMounted.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserData(user.uid);
      } else {
        setCurrentUser(null);
        setUserData({});
        setIsLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
      clearTimeout(loadingTimeout.current);
      clearTimeout(retryTimeout.current);
    };
  }, [fetchUserData]);

  return (
    <UserContext.Provider value={{ userData, setUserData, currentUser, isLoading, setIsLoading }}>
      {isLoading && <ScreenLoad />}
      {children}
      {/* <ToastContainer /> */}
    </UserContext.Provider>
  );
};
