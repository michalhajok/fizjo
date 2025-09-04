"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, validateResetToken } from "@/lib/api";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  // Walidacja tokenu przy ładowaniu strony
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setErrors({ general: "Brak tokenu resetowania hasła" });
        setValidatingToken(false);
        return;
      }

      try {
        const { error } = await validateResetToken(token);
        if (error) {
          setErrors({ general: "Token jest nieprawidłowy lub wygasł" });
          setTokenValid(false);
        } else {
          setTokenValid(true);
        }
      } catch (err) {
        setErrors({ general: "Błąd weryfikacji tokenu" });
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Usuń błąd dla tego pola
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Walidacja hasła
    if (!form.password) {
      newErrors.password = "Hasło jest wymagane";
    } else if (form.password.length < 8) {
      newErrors.password = "Hasło musi mieć co najmniej 8 znaków";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password =
        "Hasło musi zawierać małą literę, wielką literę i cyfrę";
    }

    // Walidacja potwierdzenia hasła
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Potwierdzenie hasła jest wymagane";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Hasła nie są identyczne";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const { error } = await resetPassword(token, form.password);

      if (error) {
        setErrors({ general: error });
      } else {
        setSuccess(true);
        // Przekieruj po 3 sekundach
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      }
    } catch (err) {
      setErrors({ general: "Wystąpił błąd podczas zmiany hasła" });
    } finally {
      setLoading(false);
    }
  };

  // Loading podczas walidacji tokenu
  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Sprawdzanie tokenu...</p>
        </div>
      </div>
    );
  }

  // Nieprawidłowy token
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AuthCard title="Błąd tokenu" subtitle="Nie można zresetować hasła">
          <div className="text-center">
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">
                {errors.general ||
                  "Token resetowania hasła jest nieprawidłowy lub wygasł"}
              </p>
            </div>

            <Button onClick={() => router.push("/signin")} className="w-full">
              Wróć do logowania
            </Button>

            <p className="mt-4 text-sm text-gray-600">
              Skontaktuj się z administratorem, aby otrzymać nowy link
              resetowania hasła.
            </p>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Sukces - hasło zostało zmienione
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AuthCard
          title="Hasło zostało zmienione"
          subtitle="Możesz się teraz zalogować"
        >
          <div className="text-center">
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-800 font-medium">
                Twoje hasło zostało pomyślnie zmienione!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Za chwilę zostaniesz przekierowany do strony logowania...
              </p>
            </div>

            <Button onClick={() => router.push("/signin")} className="w-full">
              Przejdź do logowania
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Formularz resetowania hasła
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense>
        <AuthCard
          title="Ustaw nowe hasło"
          subtitle="Wprowadź nowe, bezpieczne hasło do Twojego konta"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Błąd ogólny */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Informacja o wymaganiach hasła */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm font-medium mb-2">
                Wymagania hasła:
              </p>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• Co najmniej 8 znaków</li>
                <li>• Zawiera małą literę (a-z)</li>
                <li>• Zawiera wielką literę (A-Z)</li>
                <li>• Zawiera cyfrę (0-9)</li>
              </ul>
            </div>

            {/* Pole hasła */}
            <Input
              type="password"
              name="password"
              label="Nowe hasło"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Wprowadź nowe hasło"
              required
              autoComplete="new-password"
            />

            {/* Potwierdzenie hasła */}
            <Input
              type="password"
              name="confirmPassword"
              label="Potwierdź hasło"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Powtórz nowe hasło"
              required
              autoComplete="new-password"
            />

            {/* Wskaźnik siły hasła */}
            {form.password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Siła hasła:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        form.password.length < 8
                          ? "w-1/4 bg-red-500"
                          : !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
                              form.password
                            )
                          ? "w-2/4 bg-yellow-500"
                          : form.password.length < 12
                          ? "w-3/4 bg-blue-500"
                          : "w-full bg-green-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      form.password.length < 8
                        ? "text-red-600"
                        : !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)
                        ? "text-yellow-600"
                        : form.password.length < 12
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {form.password.length < 8
                      ? "Słabe"
                      : !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)
                      ? "Średnie"
                      : form.password.length < 12
                      ? "Dobre"
                      : "Bardzo dobre"}
                  </span>
                </div>
              </div>
            )}

            {/* Przycisk submit */}
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Zmienianie hasła..." : "Zmień hasło"}
            </Button>

            {/* Link powrotu */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/signin")}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Wróć do logowania
              </button>
            </div>
          </form>
        </AuthCard>
      </Suspense>
    </div>
  );
}
