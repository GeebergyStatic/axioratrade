import React, { createContext, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useUserContext } from './UserRoleContext';
import firstNamesJson from './first-names.json';

const ToastContext = createContext();

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider = ({ children }) => {
  const intervalRef = useRef(null); // Reference to store the interval ID
  const BASE_URL = 'https://restcountries.com/v3.1/all';

  useEffect(() => {
    let names = [];
    let countries = [];

    const fetchCountries = async () => {
      try {
        const response = await axios.get(BASE_URL);
        names = Array.isArray(firstNamesJson) ? firstNamesJson : [];

        countries = response.data.map((country) => ({
          value: country.name.common,
          label: country.name.common,
        }));

        startToastNotifications();
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    const showNotification = () => {
      const randomNumber = Math.floor(Math.random() * (25000 - 2000 + 1)) + 2000;
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(randomNumber);

      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)].label;

      toast.success(`${randomName} just cashed out ${formattedAmount} from ${randomCountry}`, {
        position: toast.POSITION.TOP_RIGHT,
        style: { width: '100%' },
        className: 'custom-toast',
      });
    };

    const startToastNotifications = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          showNotification();
        }
      }, 20000);
    };

    // Fetch countries and names
    fetchCountries();

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  return (
    <ToastContext.Provider value={{}}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        closeOnClick
        pauseOnHover
        limit={1} // 👈 Limits how many are shown at once
      />

      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
