"use client";
import React, { useState, useRef, useEffect } from "react";

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Wybierz opcję",
  disabled = false,
  multiple = false,
  searchable = false,
  error = false,
  className = "",
  size = "md",
  required = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

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

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setHighlightedIndex(0);
    }
  };

  const handleOptionClick = (option) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? value : [];
      const isSelected = newValue.some((item) => item.value === option.value);

      if (isSelected) {
        onChange(newValue.filter((item) => item.value !== option.value));
      } else {
        onChange([...newValue, option]);
      }
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleRemoveOption = (optionToRemove, e) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((item) => item.value !== optionToRemove.value));
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} wybranych` : placeholder;
    }

    return value ? value.label : placeholder;
  };

  const isOptionSelected = (option) => {
    if (multiple && Array.isArray(value)) {
      return value.some((item) => item.value === option.value);
    }
    return value && value.value === option.value;
  };

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      {label && (
        <label
          htmlFor={id || undefined}
          className="block text-sm font-medium text-gray-700 mb-1 pt-3"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`
          relative w-full border rounded-md shadow-sm cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700
          ${getSizeClasses()}
          ${error ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
        `}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        id={id}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center text-gray-700">
            {multiple && Array.isArray(value) && value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {value.map((item, index) => (
                  <span
                    key={item.value}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {item.label}
                    <button
                      onClick={(e) => handleRemoveOption(item, e)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <svg
                        className="w-3 h-3"
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
                  </span>
                ))}
              </div>
            ) : (
              <span
                className={`block truncate${!value ? "text-gray-600" : ""}`}
              >
                {getDisplayValue()}
              </span>
            )}
          </div>

          <div className="flex items-center ml-2 text-gray-700">
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Szukaj..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
          )}

          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-700">Brak opcji</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer flex items-center justify-between text-gray-500
                    ${
                      index === highlightedIndex
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }
                    ${
                      isOptionSelected(option)
                        ? "bg-blue-100 text-blue-900"
                        : ""
                    }
                  `}
                  onClick={() => handleOptionClick(option)}
                >
                  <span>{option.label}</span>
                  {isOptionSelected(option) && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
