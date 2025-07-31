"use client";
import { useState, useEffect } from "react";

const useMediaQuery = (query, defaultValue = false) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Ustaw początkową wartość
    setMatches(mediaQuery.matches);

    // Funkcja obsługująca zmiany
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Dodaj listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback dla starszych przeglądarek
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};

// Predefiniowane breakpointy dla Tailwind CSS
export const useBreakpoint = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isLargeDesktop = useMediaQuery("(min-width: 1280px)");

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    device: isMobile
      ? "mobile"
      : isTablet
      ? "tablet"
      : isDesktop
      ? "desktop"
      : "large-desktop",
  };
};

export default useMediaQuery;
