import React from "react";

const Spinner = ({
  size = "md",
  color = "blue",
  className = "",
  text = "",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "w-4 h-4";
      case "sm":
        return "w-6 h-6";
      case "md":
        return "w-8 h-8";
      case "lg":
        return "w-12 h-12";
      case "xl":
        return "w-16 h-16";
      default:
        return "w-8 h-8";
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "text-blue-600";
      case "green":
        return "text-green-600";
      case "red":
        return "text-red-600";
      case "yellow":
        return "text-yellow-600";
      case "purple":
        return "text-purple-600";
      case "pink":
        return "text-pink-600";
      case "gray":
        return "text-gray-600";
      case "white":
        return "text-white";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className={`flex flex-col items-center ${className} animate-pulse`}>
      <div className={`animate-spin ${getSizeClasses()} ${getColorClasses()}`}>
        <svg fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// Variant with dots
const DotsSpinner = ({ size = "md", color = "blue", className = "" }) => {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "w-1 h-1";
      case "sm":
        return "w-2 h-2";
      case "md":
        return "w-3 h-3";
      case "lg":
        return "w-4 h-4";
      case "xl":
        return "w-5 h-5";
      default:
        return "w-3 h-3";
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-600";
      case "green":
        return "bg-green-600";
      case "red":
        return "bg-red-600";
      case "yellow":
        return "bg-yellow-600";
      case "purple":
        return "bg-purple-600";
      case "pink":
        return "bg-pink-600";
      case "gray":
        return "bg-gray-600";
      case "white":
        return "bg-white";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div
        className={`${getSizeClasses()} ${getColorClasses()} rounded-full animate-bounce`}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={`${getSizeClasses()} ${getColorClasses()} rounded-full animate-bounce`}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={`${getSizeClasses()} ${getColorClasses()} rounded-full animate-bounce`}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
};

// Variant with pulse
const PulseSpinner = ({ size = "md", color = "blue", className = "" }) => {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "w-4 h-4";
      case "sm":
        return "w-6 h-6";
      case "md":
        return "w-8 h-8";
      case "lg":
        return "w-12 h-12";
      case "xl":
        return "w-16 h-16";
      default:
        return "w-8 h-8";
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-600";
      case "green":
        return "bg-green-600";
      case "red":
        return "bg-red-600";
      case "yellow":
        return "bg-yellow-600";
      case "purple":
        return "bg-purple-600";
      case "pink":
        return "bg-pink-600";
      case "gray":
        return "bg-gray-600";
      case "white":
        return "bg-white";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div
      className={`${getSizeClasses()} ${getColorClasses()} rounded-full animate-pulse ${className}`}
    />
  );
};

Spinner.Dots = DotsSpinner;
Spinner.Pulse = PulseSpinner;

export default Spinner;
