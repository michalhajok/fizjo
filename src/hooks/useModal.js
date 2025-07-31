// src/hooks/useModal.js
import { useState, useCallback, useEffect } from "react";

const useModal = (initialState = false, options = {}) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const {
    onOpen,
    onClose,
    preventScroll = true,
    closeOnEscape = true,
    closeOnBackdrop = true,
  } = options;

  const open = useCallback(
    (modalData = null) => {
      setData(modalData);
      setIsOpen(true);
      if (onOpen) {
        onOpen(modalData);
      }
    },
    [onOpen]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Obsługa klawisza Escape
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, close, closeOnEscape]);

  // Blokowanie przewijania
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventScroll]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
  };
};

// Hook dla zarządzania wieloma modalami
export const useMultiModal = () => {
  const [modals, setModals] = useState({});

  const openModal = useCallback((id, data = null) => {
    setModals((prev) => ({
      ...prev,
      [id]: { isOpen: true, data },
    }));
  }, []);

  const closeModal = useCallback((id) => {
    setModals((prev) => ({
      ...prev,
      [id]: { isOpen: false, data: null },
    }));
  }, []);

  const toggleModal = useCallback((id, data = null) => {
    setModals((prev) => {
      const current = prev[id];
      if (current?.isOpen) {
        return {
          ...prev,
          [id]: { isOpen: false, data: null },
        };
      } else {
        return {
          ...prev,
          [id]: { isOpen: true, data },
        };
      }
    });
  }, []);

  const isModalOpen = useCallback(
    (id) => {
      return modals[id]?.isOpen || false;
    },
    [modals]
  );

  const getModalData = useCallback(
    (id) => {
      return modals[id]?.data || null;
    },
    [modals]
  );

  const closeAllModals = useCallback(() => {
    setModals({});
  }, []);

  return {
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    getModalData,
    closeAllModals,
    modals,
  };
};

export default useModal;
