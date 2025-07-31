import React from "react";

const Checkbox = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  className = "",
  ...props
}) => {
  return (
    <label
      className={`flex items-center cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={`
        relative w-5 h-5 border-2 rounded transition-colors duration-200
        ${
          checked
            ? "bg-blue-600 border-blue-600"
            : "bg-white border-gray-300 hover:border-gray-400"
        }
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
      >
        {checked && (
          <svg
            className="absolute inset-0 w-3 h-3 m-auto text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      {label && <span className="ml-2 text-sm">{label}</span>}
    </label>
  );
};

export default Checkbox;
