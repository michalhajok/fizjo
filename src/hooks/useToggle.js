// src/hooks/useToggle.js
import { useState, useCallback } from "react";

const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
};

// Wersja z wieloma wartościami
export const useToggleState = (values = [], initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const toggle = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % values.length);
  }, [values.length]);

  const setIndex = useCallback(
    (index) => {
      if (index >= 0 && index < values.length) {
        setCurrentIndex(index);
      }
    },
    [values.length]
  );

  const setValue = useCallback(
    (value) => {
      const index = values.indexOf(value);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    },
    [values]
  );

  return {
    value: values[currentIndex],
    index: currentIndex,
    toggle,
    setIndex,
    setValue,
    next: toggle,
    prev: useCallback(() => {
      setCurrentIndex((prev) => (prev === 0 ? values.length - 1 : prev - 1));
    }, [values.length]),
  };
};

export default useToggle;
