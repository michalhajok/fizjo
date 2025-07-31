"use client";
import { useState, useCallback, useRef } from "react";

const useNotification = (defaultDuration = 5000) => {
  const [notifications, setNotifications] = useState([]);
  const notificationIdRef = useRef(0);

  const addNotification = useCallback(
    (notification) => {
      const id = ++notificationIdRef.current;
      const newNotification = {
        id,
        type: "info",
        duration: defaultDuration,
        ...notification,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove notification
      if (newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },
    [defaultDuration]
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateNotification = useCallback((id, updates) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    );
  }, []);

  // Wygodne metody dla różnych typów powiadomień
  const success = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: "success",
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const error = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: "error",
        message,
        duration: 0, // Error notifications don't auto-hide by default
        ...options,
      });
    },
    [addNotification]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: "warning",
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const info = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: "info",
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const loading = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: "loading",
        message,
        duration: 0, // Loading notifications don't auto-hide
        ...options,
      });
    },
    [addNotification]
  );

  // Promise-based notifications
  const promise = useCallback(
    async (promise, messages, options = {}) => {
      const loadingId = loading(messages.loading || "Ładowanie...", options);

      try {
        const result = await promise;
        removeNotification(loadingId);
        success(messages.success || "Operacja zakończona pomyślnie", options);
        return result;
      } catch (err) {
        removeNotification(loadingId);
        error(messages.error || "Wystąpił błąd", options);
        throw err;
      }
    },
    [loading, removeNotification, success, error]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateNotification,
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };
};

export default useNotification;
