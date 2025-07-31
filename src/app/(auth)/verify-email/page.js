// src/app/(auth)/verify-email/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../components/ui/Toast";
import AuthCard from "../_components/AuthCard";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(null);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [token, setToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyEmail(tokenFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const verifyEmail = async (token) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        toast.success("Email został pomyślnie zweryfikowany!");
      } else {
        setIsVerified(false);
        toast.error(data.message || "Błąd weryfikacji");
      }
    } catch (error) {
      setIsVerified(false);
      toast.error("Wystąpił błąd połączenia");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Email weryfikacyjny został wysłany ponownie");
        setCanResend(false);
        setCountdown(60);
      } else {
        toast.error(data.message || "Błąd wysyłania email");
      }
    } catch (error) {
      toast.error("Wystąpił błąd połączenia");
    } finally {
      setIsLoading(false);
    }
  };

  // Sprawdzanie tokenu w trakcie
  if (token && isVerified === null) {
    return (
      <AuthCard title="Weryfikacja email...">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sprawdzamy Twój email...</p>
        </div>
      </AuthCard>
    );
  }

  // Pomyślna weryfikacja
  if (isVerified === true) {
    return (
      <AuthCard
        title="Email zweryfikowany!"
        subtitle="Twoje konto zostało pomyślnie aktywowane"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <p className="text-gray-600">
            Twoje konto zostało pomyślnie aktywowane. Możesz teraz korzystać z
            wszystkich funkcji aplikacji.
          </p>

          <div className="pt-4">
            <Link href="/signin">
              <Button className="w-full">Przejdź do logowania</Button>
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  // Błąd weryfikacji
  if (isVerified === false) {
    return (
      <AuthCard
        title="Błąd weryfikacji"
        subtitle="Nie udało się zweryfikować adresu email"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>

          <p className="text-gray-600">
            Link weryfikacyjny jest nieprawidłowy, wygasł lub został już użyty.
          </p>

          <div className="pt-4">
            <Button
              onClick={handleResendEmail}
              disabled={!canResend || isLoading}
              className="w-full"
              loading={isLoading}
            >
              {canResend
                ? "Wyślij ponownie"
                : `Wyślij ponownie (${countdown}s)`}
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  // Domyślny widok - brak tokenu
  return (
    <AuthCard
      title="Weryfikacja adresu email"
      subtitle="Sprawdź swoją skrzynkę pocztową"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <p className="text-gray-600">
          Wysłaliśmy link weryfikacyjny na Twój adres email. Kliknij w link, aby
          aktywować konto.
        </p>

        <p className="text-sm text-gray-500">
          Jeśli nie widzisz wiadomości, sprawdź folder spam lub śmieci.
        </p>

        <div className="pt-4">
          <Button
            onClick={handleResendEmail}
            disabled={!canResend || isLoading}
            variant="outline"
            className="w-full"
            loading={isLoading}
          >
            {canResend ? "Wyślij ponownie" : `Wyślij ponownie (${countdown}s)`}
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/signin"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Wróć do logowania
        </Link>
      </div>
    </AuthCard>
  );
}
