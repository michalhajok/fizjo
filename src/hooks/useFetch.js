"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const {
    method = "GET",
    headers = {},
    body = null,
    immediate = true,
    onSuccess,
    onError,
    transform,
    ...fetchOptions
  } = options;

  const fetchData = useCallback(
    async (customUrl = url, customOptions = {}) => {
      if (!customUrl) return;

      setLoading(true);
      setError(null);

      // Anuluj poprzednie żądanie
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const defaultHeaders = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...headers,
          ...customOptions.headers,
        };

        const config = {
          method,
          headers: defaultHeaders,
          signal: abortControllerRef.current.signal,
          ...fetchOptions,
          ...customOptions,
        };

        if (
          body &&
          (method === "POST" || method === "PUT" || method === "PATCH")
        ) {
          config.body = typeof body === "string" ? body : JSON.stringify(body);
        }

        const response = await fetch(customUrl, config);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let result = await response.json();

        // Transformuj dane jeśli podano funkcję transform
        if (transform && typeof transform === "function") {
          result = transform(result);
        }

        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          if (onError) {
            onError(err);
          }
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method, body, headers, onSuccess, onError, transform]
  );

  const refetch = useCallback(
    (customOptions = {}) => {
      return fetchData(url, customOptions);
    },
    [fetchData, url]
  );

  const mutate = useCallback((newData) => {
    setData(newData);
  }, []);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, immediate, url]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    execute: fetchData,
  };
};

export default useFetch;
