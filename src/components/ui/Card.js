import React from "react";

const Card = ({
  children,
  className = "",
  shadow = "md",
  padding = "md",
  hover = false,
}) => {
  const getShadowClasses = () => {
    switch (shadow) {
      case "sm":
        return "shadow-sm";
      case "md":
        return "shadow-md";
      case "lg":
        return "shadow-lg";
      case "xl":
        return "shadow-xl";
      case "none":
        return "";
      default:
        return "shadow-md";
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case "sm":
        return "p-3";
      case "md":
        return "p-4";
      case "lg":
        return "p-6";
      case "xl":
        return "p-8";
      case "none":
        return "";
      default:
        return "p-4";
    }
  };

  const baseClasses = `
    bg-white rounded-lg border border-gray-200
    ${getShadowClasses()}
    ${getPaddingClasses()}
    ${hover ? "hover:shadow-lg transition-shadow duration-200" : ""}
    ${className}
  `;

  return <div className={baseClasses}>{children}</div>;
};

const CardHeader = ({ children, className = "" }) => (
  <div
    className={`border-b border-gray-200 pb-3 mb-4 text-gray-700 ${className}`}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-700 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`text-gray-700  ${className}`}>{children}</div>
);

const CardFooter = ({ children, className = "" }) => (
  <div
    className={`border-t border-gray-200 pt-3 mt-4 text-gray-700 ${className}`}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
