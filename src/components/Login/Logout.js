import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import secureLocalStorage from "react-secure-storage";
import axios from 'axios';
import Environment from "../../environment";
import { toast } from 'react-toastify';
import { encryptData } from '../Encrypt-decrypt';

const Logout = () => {
  const navigate = useNavigate();
  const inactivityTimerRef = useRef(null);
  const maxLoginTimerRef = useRef(null);
  const username = secureLocalStorage.getItem('userId');
  const deviceId = secureLocalStorage.getItem('deviceId');
  const token = secureLocalStorage.getItem('token');

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/AuthLogout?username=${encryptData(username)}&DeviceId=${encryptData(deviceId)}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data) {
        secureLocalStorage.clear()
        navigate('/');
      } else {
        toast.error('Logout failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong.')
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(handleLogout, 1000 * 60 * 1000); // 15 minutes
  };

  const startMaxLoginTimer = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const elapsedTime = Date.now() - parseInt(loginTime, 10);
      const maxLoginDuration = 8 * 60 * 60 * 1000; // 8 hours
      const remainingTime = maxLoginDuration - elapsedTime;

      if (remainingTime > 0) {
        if (maxLoginTimerRef.current) {
          clearTimeout(maxLoginTimerRef.current);
        }
        maxLoginTimerRef.current = setTimeout(handleLogout, remainingTime);
      } else {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // When the tab becomes inactive, reset the inactivity timer
        resetInactivityTimer();
      } else {
        // When the tab becomes active again, reset the inactivity timer
        resetInactivityTimer();
      }
    };

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize timers on component mount
    resetInactivityTimer();
    startMaxLoginTimer();

    return () => {
      // Cleanup event listener and timers on component unmount
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (maxLoginTimerRef.current) {
        clearTimeout(maxLoginTimerRef.current);
      }
    };
  }, []);

  return (
    <Link onClick={handleLogout} className="RegisterEmployeeBtn">
      <span><i className="fas fa-sign-out-alt"></i>  Logout</span>
    </Link>
  );
};

export default Logout;
