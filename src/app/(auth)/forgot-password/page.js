// src/app/(auth)/forgot-password/page.js
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import AuthCard from "@/components/auth/AuthCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email jest wymagany");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Nieprawidłowy format email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        toast.success("Link do resetowania hasła został wysłany na email");
      } else {
        setError(data.message || "Wystąpił błąd");
      }
    } catch (error) {
      setError("Wystąpił błąd połączenia");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  if (isEmailSent) {
    return (
      <AuthCard
        title="Email został wysłany"
        subtitle="Sprawdź swoją skrzynkę pocztową"
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
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <p className="text-gray-600">
            Wysłaliśmy link do resetowania hasła na adres{" "}
            <strong>{email}</strong>
          </p>

          <p className="text-sm text-gray-500">
            Jeśli nie widzisz wiadomości, sprawdź folder spam lub śmieci.
          </p>

          <div className="pt-4">
            <Button
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
              }}
              variant="outline"
              className="w-full"
            >
              Wyślij ponownie
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

  return (
    <AuthCard
      title="Resetowanie hasła"
      subtitle="Wprowadź email, aby otrzymać link do resetowania hasła"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Adres email"
          type="email"
          value={email}
          onChange={handleChange}
          error={error}
          placeholder="wprowadz@email.com"
          required
          disabled={isLoading}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
        />

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Wyślij link resetowania
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Pamiętasz hasło?{" "}
          <Link
            href="/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
