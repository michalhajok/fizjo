"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-8xl">💥</div>
            <div>
              <h1 className="text-2xl font-bold">Krytyczny błąd systemu</h1>
              <p className="text-gray-600 mt-2">
                Wystąpił poważny błąd w aplikacji. Spróbuj ponownie.
              </p>
            </div>
            <button
              onClick={reset}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
