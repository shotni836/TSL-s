import React, { useState, useEffect } from 'react';
import secureLocalStorage from "react-secure-storage";

const Timer = () => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const loginTime = parseInt(secureLocalStorage.getItem('loginTime'), 10);
    if (!loginTime) return;

    const updateElapsedTime = () => {
      setElapsedTime(Date.now() - loginTime);
    };

    const intervalId = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div>
      <p>Timer : {formatTime(elapsedTime)}</p>
    </div>
  );
};

export default Timer;