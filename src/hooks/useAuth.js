"use client";
import { useState, useContext, createContext, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  signIn,
  signUp,
  logOut as apiLogOut,
  updateProfile as apiUpdateProfile,
  verifyToken,
} from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // 1. Ładuj user z localStorage po stronie klienta
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  //2. Weryfikuj accessToken po odświeżeniu strony (silent login)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && !user) {
      setLoading(true);
      verifyToken().then(({ data, error }) => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          doLogout();
          router.push("/signin");
        }
        setLoading(false);
      });
    }
  }, [user]);

  // 3. Logowanie
  const login = async (dataForm) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await signIn(dataForm);

      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
        // Tokeny już są ustawiane w signIn (patrz api.js)
        return { success: true, user: data.user };
      } else {
        setError(error || "Błąd logowania");
        return { success: false, error: error || "Błąd logowania" };
      }
    } catch (err) {
      setError("Błąd połączenia");
      return { success: false, error: "Błąd połączenia" };
    } finally {
      setLoading(false);
    }
  };

  // 4. Rejestracja
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await signUp(userData);
      if (data) {
        return { success: true, message: "Konto utworzone pomyślnie" };
      } else {
        setError(error);
        return { success: false, error };
      }
    } catch (err) {
      setError("Błąd połączenia");
      return { success: false, error: "Błąd połączenia" };
    } finally {
      setLoading(false);
    }
  };

  // 5. Wylogowanie
  const doLogout = async () => {
    setLoading(true);
    try {
      await apiLogOut();
    } catch (err) {
      // ignoruj błąd
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/signin");
      setLoading(false);
    }
  };

  // 6. Aktualizacja profilu
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await apiUpdateProfile(profileData);
      if (data?.user) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        setError(error);
        return { success: false, error };
      }
    } catch (err) {
      setError("Błąd połączenia");
      return { success: false, error: "Błąd połączenia" };
    } finally {
      setLoading(false);
    }
  };

  // 7. Uprawnienia
  const isAuthenticated = () => {
    return (
      !!user &&
      typeof window !== "undefined" &&
      !!localStorage.getItem("accessToken")
    );
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasPermission = (permission) => {
    return user && user.permissions && user.permissions.includes(permission);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout: doLogout,
    updateProfile,
    isAuthenticated,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
