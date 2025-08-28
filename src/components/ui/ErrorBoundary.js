"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Tu można dodać logging do Sentry lub innego serwisu
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h1 className="text-xl font-bold">Coś poszło nie tak</h1>
              <p className="text-gray-600">
                Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.
              </p>
              <div className="space-x-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                >
                  Odśwież stronę
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                >
                  Wróć do dashboard
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && (
                <details className="text-left mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Szczegóły błędu (dev only)
                  </summary>
                  <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
