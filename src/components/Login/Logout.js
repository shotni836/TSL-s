import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import secureLocalStorage from "react-secure-storage";

const Logout = () => {
  const navigate = useNavigate();
  const inactivityTimerRef = useRef(null);
  const maxLoginTimerRef = useRef(null);

  const handleLogout = () => {
    const loginTime = secureLocalStorage.getItem('loginTime');
    if (loginTime) {
      const loginDuration = Date.now() - parseInt(loginTime, 10);
      console.log(`User was logged in for ${loginDuration} milliseconds`);

      // Clear all relevant localStorage items
      secureLocalStorage.removeItem('userId');
      secureLocalStorage.removeItem('token');
      secureLocalStorage.removeItem('userFullName');
      secureLocalStorage.removeItem('userDesignation');
      secureLocalStorage.removeItem('userDepartment');
      secureLocalStorage.removeItem('userRole');
      secureLocalStorage.removeItem('loginTime');
      secureLocalStorage.removeItem('departmentId');
      secureLocalStorage.removeItem('empId');
      secureLocalStorage.clear()
    }
    navigate('/');
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
      const remainingTime = 8 * 60 * 60 * 1000 - elapsedTime; // 8 hours

      if (maxLoginTimerRef.current) {
        clearTimeout(maxLoginTimerRef.current);
      }

      maxLoginTimerRef.current = setTimeout(handleLogout, remainingTime);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab is now inactive
        resetInactivityTimer();
      } else {
        // Tab is now active
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
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
    <Link to="/" onClick={handleLogout} className="RegisterEmployeeBtn">
      <span><i className="fas fa-sign-out-alt"></i>  Logout</span>
    </Link>
  );
};

export default Logout;
