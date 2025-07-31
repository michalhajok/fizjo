"use client";

import React, { useState, forwardRef } from "react";

const Input = forwardRef(
  (
    {
      type = "text",
      label,
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      error,
      helperText,
      required = false,
      disabled = false,
      className = "",
      size = "md",
      icon,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "px-3 py-1.5 text-sm";
        case "md":
          return "px-3 py-2 text-base";
        case "lg":
          return "px-4 py-3 text-lg";
        default:
          return "px-3 py-2 text-base";
      }
    };

    const handleFocus = (e) => {
      setFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
      setFocused(false);
      if (onBlur) onBlur(e);
    };

    const baseClasses = `
    w-full border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700
    ${getSizeClasses()}
    ${error ? "border-red-500" : "border-gray-300"}
    ${focused ? "ring-2 ring-blue-500 border-blue-500" : ""}
    ${icon ? "pl-10" : ""}
    ${className}
  `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1  pt-3">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">{icon}</div>
            </div>
          )}

          <input
            ref={ref}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClasses}
            {...props}
          />
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
