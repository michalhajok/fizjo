// src/hooks/useEventListener.js
import { useEffect, useRef } from "react";

const useEventListener = (eventName, handler, element = null, options = {}) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element?.current || element || window;

    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    const eventListener = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
};

// Wersja dla wielu eventów
export const useMultipleEventListener = (
  events,
  handler,
  element = null,
  options = {}
) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element?.current || element || window;

    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    const eventListener = (event) => savedHandler.current(event);

    events.forEach((eventName) => {
      targetElement.addEventListener(eventName, eventListener, options);
    });

    return () => {
      events.forEach((eventName) => {
        targetElement.removeEventListener(eventName, eventListener, options);
      });
    };
  }, [events, element, options]);
};

export default useEventListener;
