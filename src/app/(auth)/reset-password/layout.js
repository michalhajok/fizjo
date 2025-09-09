import React, { Suspense } from "react";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata = {
  title: "Uwierzytelnianie - FizGab",
  description: "Zaloguj się do systemu zarządzania gabinetem fizjoterapii",
  robots: "noindex, nofollow",
};

const AuthLayout = ({ children }) => {
  return <Suspense>{children}</Suspense>;
};

export default AuthLayout;
