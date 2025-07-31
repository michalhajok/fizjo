import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const getVariantClasses = () => {
    if (disabled) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }

    switch (variant) {
      case "primary":
        return "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500";
      case "outline":
        return "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500";
      case "ghost":
        return "text-blue-600 hover:bg-blue-50 focus:ring-blue-500";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "md":
        return "px-4 py-2 text-base";
      case "lg":
        return "px-6 py-3 text-lg";
      default:
        return "px-4 py-2 text-base";
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center
    ${getSizeClasses()}
    ${getVariantClasses()}
    font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    ${className}
  `;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={baseClasses}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
