import React from "react";

const Avatar = ({
  src,
  alt = "Avatar",
  size = "md",
  name = "",
  className = "",
  variant = "circular",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "h-6 w-6 text-xs";
      case "sm":
        return "h-8 w-8 text-sm";
      case "md":
        return "h-10 w-10 text-base";
      case "lg":
        return "h-12 w-12 text-lg";
      case "xl":
        return "h-16 w-16 text-xl";
      default:
        return "h-10 w-10 text-base";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rounded":
        return "rounded-lg";
      case "square":
        return "rounded-none";
      default:
        return "rounded-full";
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const generateColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-red-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const baseClasses = `
    ${getSizeClasses()}
    ${getVariantClasses()}
    inline-flex items-center justify-center
    font-medium text-white
    ${className}
  `;

  if (src) {
    return (
      <img src={src} alt={alt} className={`${baseClasses} object-cover`} />
    );
  }

  if (name) {
    return (
      <div className={`${baseClasses} ${generateColor(name)}`}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-gray-300`}>
      <svg
        className="w-1/2 h-1/2 text-gray-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};

export default Avatar;
