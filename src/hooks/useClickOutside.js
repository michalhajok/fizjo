// src/hooks/useClickOutside.js
"use client";

import { useEffect, useRef } from "react";

const useClickOutside = (handler, events = ["mousedown", "touchstart"]) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };

    events.forEach((eventName) => {
      document.addEventListener(eventName, handleClickOutside, true);
    });

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, handleClickOutside, true);
      });
    };
  }, [handler, events]);

  return ref;
};

// Wersja dla wielu elementów
export const useClickOutsideMultiple = (
  handler,
  events = ["mousedown", "touchstart"]
) => {
  const refs = useRef([]);

  const addRef = (element) => {
    if (element && !refs.current.includes(element)) {
      refs.current.push(element);
    }
  };

  const removeRef = (element) => {
    refs.current = refs.current.filter((ref) => ref !== element);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = refs.current.every(
        (ref) => !ref || !ref.contains(event.target)
      );

      if (clickedOutside) {
        handler(event);
      }
    };

    events.forEach((eventName) => {
      document.addEventListener(eventName, handleClickOutside, true);
    });

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, handleClickOutside, true);
      });
    };
  }, [handler, events]);

  return { addRef, removeRef };
};

export default useClickOutside;
