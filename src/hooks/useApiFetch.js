"use client";

import { useState, useEffect, useCallback } from "react";

export default function useApiFetch(fn, args = [], immediate = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(immediate ? "pending" : "idle");

  const execute = useCallback(
    async (...params) => {
      setStatus("pending");
      setError(null);
      try {
        const { data, error, status } = await fn(...params);
        setStatus(status < 400 ? "success" : "error");
        if (error) setError(error);
        else setData(data);
        return { data, error, status };
      } catch (err) {
        setError(err.message);
        setStatus("error");
        return { data: null, error: err.message, status: 0 };
      }
    },
    [fn]
  );

  useEffect(() => {
    if (immediate) {
      execute(...args);
    }
  }, [execute, immediate, ...args]);

  return { data, error, status, refetch: execute };
}
