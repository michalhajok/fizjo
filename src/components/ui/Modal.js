import React, { useEffect } from "react";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = "",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md mx-4";
      case "md":
        return "max-w-lg mx-4";
      case "lg":
        return "max-w-2xl mx-4";
      case "xl":
        return "max-w-4xl mx-4";
      case "full":
        return "max-w-full mx-2";
      default:
        return "max-w-lg mx-4";
    }
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-200/50" />

        {/* Modal */}
        <div
          className={`
              relative m-16 self-center justify-self-center text-left align-center transition-all transform
              bg-white rounded-lg shadow-xl sm:align-middle sm:max-w-lg sm:w-full 
              ${getSizeClasses()}
              ${className}
            `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-black-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className = "" }) => (
  <div className={`p-4 border-b border-gray-200 ${className}`}>{children}</div>
);

const ModalBody = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const ModalFooter = ({ children, className = "" }) => (
  <div className={`p-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
