import { NextResponse } from "next/server";

export function middleware(request) {
  // Sprawdź czy użytkownik ma token dostępu
  const token =
    request.cookies.get("accessToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Sciezki wymagające autoryzacji
  const protectedPaths = ["/dashboard"];
  const authPaths = ["/signin", "/reset-password"];

  const { pathname } = request.nextUrl;

  // Jeśli użytkownik jest na chronionej ścieżce bez tokenu
  if (protectedPaths.some((path) => pathname.startsWith(path)) && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Jeśli zalogowany użytkownik próbuje dostać się na stronę auth
  if (authPaths.some((path) => pathname.startsWith(path)) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/reset-password"],
};
