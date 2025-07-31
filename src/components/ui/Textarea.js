"use client";
import React from "react";

export default function Textarea({
  label,
  value,
  onChange,
  name,
  rows = 4,
  placeholder = "",
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block mb-1 font-medium text-gray-700" htmlFor={name}>
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        rows={rows}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-y text-gray-700"
        {...props}
      />
    </div>
  );
}
