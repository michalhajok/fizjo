// src/components/layout/Footer.js
import React from "react";

const Footer = ({ className = "" }) => (
  <footer className={`bg-white border-t border-gray-200 ${className}`}>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()} FizGab. Wszelkie prawa zastrzeżone.
      </p>
      <div className="mt-2 md:mt-0 flex space-x-4">
        <a
          href="/privacy"
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          Polityka prywatności
        </a>
        <a href="/terms" className="text-sm text-gray-500 hover:text-blue-600">
          Regulamin
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
