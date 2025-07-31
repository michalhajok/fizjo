// src/hooks/useAsync.js
import { useState, useCallback, useRef, useEffect } from "react";

const useAsync = (asyncFunction, immediate = false, dependencies = []) => {
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const asyncFunctionRef = useRef(asyncFunction);
  const abortControllerRef = useRef(null);

  // Aktualizuj referencję funkcji
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  const execute = useCallback(async (...params) => {
    // Anuluj poprzednie żądanie
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setStatus("pending");
    setError(null);

    try {
      const result = await asyncFunctionRef.current({
        signal: abortControllerRef.current.signal,
        ...params[0],
      });

      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err);
        setStatus("error");
      }
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Wykonaj automatycznie jeśli immediate = true
  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, ...dependencies]);

  return {
    execute,
    reset,
    status,
    data,
    error,
    isIdle: status === "idle",
    isPending: status === "pending",
    isSuccess: status === "success",
    isError: status === "error",
  };
};

export default useAsync;
