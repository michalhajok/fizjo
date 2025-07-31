import React from "react";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata = {
  title: "Uwierzytelnianie - FizjoCare",
  description: "Zaloguj się do systemu zarządzania gabinetem fizjoterapii",
  robots: "noindex, nofollow",
};

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Lewa strona - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <Link href="/" className="text-3xl font-bold mb-8 block">
            Fizjo<span className="text-blue-200">Care</span>
          </Link>

          <h2 className="text-2xl font-semibold mb-4">
            Profesjonalne zarządzanie gabinetem fizjoterapii
          </h2>

          <p className="text-blue-100 mb-8 leading-relaxed">
            Kompleksowe narzędzie do zarządzania pacjentami, terminami wizyt,
            historią leczenia i rozliczeniami w jednym miejscu.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Zarządzanie kartami pacjentów</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Kalendarz wizyt i terminów</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Raporty i statystyki</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prawa strona - Formularz */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo dla mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Fizjo<span className="text-blue-800">Care</span>
            </Link>
          </div>

          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            {children}
          </div>

          {/* Dodatkowe linki */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Potrzebujesz pomocy?{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-500"
              >
                Skontaktuj się z nami
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
