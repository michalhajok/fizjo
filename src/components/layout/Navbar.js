"use client";

import React from "react";
import Avatar from "../ui/Avatar";
import { useAuth } from "@/hooks";

const Navbar = ({ onMenuClick }) => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <aside className="bg-white w-64 border-r border-gray-200 min-h-screen flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-blue-600 text-xl border-b border-gray-100">
          FizjoCare
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-400">Ładowanie...</span>
        </div>
      </aside>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <button onClick={onMenuClick} className="p-2">
        {/* Hamburger icon */}
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex items-center space-x-4">
        <span className="text-gray-700">
          Panel – {user.firstName} {user.lastName}
        </span>
        <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} />
      </div>
    </nav>
  );
};

export default Navbar;
