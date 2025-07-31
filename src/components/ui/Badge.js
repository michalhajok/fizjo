import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  color = "blue",
  className = "",
  dot = false,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "solid":
        return `bg-${color}-600 text-white`;
      case "outline":
        return `border border-${color}-600 text-${color}-600 bg-transparent`;
      case "soft":
        return `bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-300`;
      default:
        return `bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-300`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "md":
        return "px-2.5 py-0.5 text-sm";
      case "lg":
        return "px-3 py-1 text-base";
      default:
        return "px-2.5 py-0.5 text-sm";
    }
  };

  const baseClasses = `
    inline-flex items-center
    ${getSizeClasses()}
    ${getVariantClasses()}
    font-medium rounded-full
    ${className}
  `;

  if (dot) {
    return (
      <span className={baseClasses}>
        <span className={`w-2 h-2 mr-1 bg-${color}-600 rounded-full`}></span>
        {children}
      </span>
    );
  }

  return <span className={baseClasses}>{children}</span>;
};

export default Badge;
