// src/hooks/useTimer.js
import { useState, useRef, useCallback, useEffect } from "react";

const useTimer = (initialTime = 0, options = {}) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const {
    interval = 1000,
    onTick,
    onComplete,
    autoStart = false,
    countDown = false,
  } = options;

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTime(initialTime);
  }, [initialTime]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(initialTime);
  }, [initialTime]);

  const setTimeValue = useCallback((newTime) => {
    setTime(newTime);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = countDown ? prevTime - 1 : prevTime + 1;

          if (onTick) {
            onTick(newTime);
          }

          if (countDown && newTime <= 0) {
            setIsRunning(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }

          return newTime;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, interval, onTick, onComplete, countDown]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  const formatTime = useCallback(
    (seconds = time) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
      return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    },
    [time]
  );

  return {
    time,
    isRunning,
    start,
    pause,
    stop,
    reset,
    setTime: setTimeValue,
    formatTime,
    toggle: isRunning ? pause : start,
  };
};

// Hook dla stopera
export const useStopwatch = (options = {}) => {
  return useTimer(0, { ...options, countDown: false });
};

// Hook dla countdown
export const useCountdown = (initialTime, options = {}) => {
  return useTimer(initialTime, { ...options, countDown: true });
};

export default useTimer;
