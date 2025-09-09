// src/components/layout/Header.js
import React from "react";
import Link from "next/link";
import Button from "../ui/Button";

const Header = () => (
  <header className="bg-white border-b border-gray-200">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link href="/" className="text-lg font-semibold text-blue-600">
        Fiz<span className="font-bold">Gab</span>
      </Link>

      <nav className="hidden md:flex space-x-6">
        <Link href="/services" className="text-gray-600 hover:text-blue-600">
          Usługi
        </Link>
        <Link href="/about" className="text-gray-600 hover:text-blue-600">
          O nas
        </Link>
        <Link href="/contact" className="text-gray-600 hover:text-blue-600">
          Kontakt
        </Link>
      </nav>

      <Button size="sm" variant="primary" className="hidden md:inline-flex">
        Zarezerwuj wizytę
      </Button>
    </div>
  </header>
);

export default Header;
