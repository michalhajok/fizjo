"use client";
import { useState } from "react";

export default function AutocompleteMultiSelect({
  label,
  options,
  value = [],
  onChange,
  placeholder = "",
}) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  return (
    <div className="block object-fill">
      {label && <label className=" font-medium mb-1">{label}</label>}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="border p-2 rounded w-full mb-1"
      />
      <div className="border rounded max-h-40 overflow-auto bg-white z-10 relative">
        {filtered.map((opt) => (
          <div
            key={opt.value}
            className={`px-2 py-1 cursor-pointer flex w-full items-center ${
              value.find((v) => v.value === opt.value)
                ? "bg-blue-100"
                : "hover:bg-gray-50"
            }`}
            onClick={() => {
              if (value.find((v) => v.value === opt.value)) {
                onChange(value.filter((v) => v.value !== opt.value));
              } else {
                onChange([...value, opt]);
              }
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {value.map((v) => (
          <span
            key={v.value}
            className="bg-blue-200 px-2 py-1 rounded-full text-xs"
          >
            {v.label}
            <button
              className="ml-1"
              onClick={() =>
                onChange(value.filter((val) => val.value !== v.value))
              }
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
