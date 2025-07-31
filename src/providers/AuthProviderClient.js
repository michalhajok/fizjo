"use client";

import { AuthProvider } from "@/hooks/useAuth";

export default function AuthProviderClient({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
