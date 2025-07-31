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
    <nav className="flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Otwórz menu"
      >
        <svg
          className="h-6 w-6"
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

      <h1 className="text-lg font-medium text-gray-700">
        Panel fizjoterapeuty
      </h1>

      <Avatar name={user.firstName + " " + user.lastName} size="sm" />
    </nav>
  );
};

export default Navbar;
