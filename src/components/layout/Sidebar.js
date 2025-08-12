"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks";
import { logOut } from "@/lib/api";

const NAV = [
  {
    href: "/dashboard",
    label: "Pulpit",
    icon: (
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
          d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 4H5a2 2 0 01-2-2V7a2 2 0 012-2h3.28a2 2 0 011.42.59l1.3 1.3a2 2 0 001.42.59h3.28a2 2 0 012 2v12a2 2 0 01-2 2z"
        />
      </svg>
    ),
    roles: ["admin", "manager", "physiotherapist", "receptionist", "assistant"],
  },
  {
    href: "/dashboard/patients",
    label: "Pacjenci",
    icon: (
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
          d="M17 20h5V10L17 5v15zM12 20h2v-9H5v9h2v-7h5v7z"
        />
      </svg>
    ),
    roles: ["admin", "manager", "physiotherapist", "receptionist"],
  },
  {
    href: "/dashboard/calendar",
    label: "Kalendarz",
    icon: (
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
          d="M8 7V3M16 7V3M4 11h16M4 19h16M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z"
        />
      </svg>
    ),
    roles: ["admin", "manager", "physiotherapist", "receptionist"],
  },
  {
    href: "/dashboard/reports",
    label: "Raporty",
    icon: (
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
          d="M8 7V3M16 7V3M4 11h16M4 19h16M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z"
        />
      </svg>
    ),
    roles: ["admin", "manager", "physiotherapist", "receptionist"],
  },
  {
    href: "/dashboard/admin",
    label: "Panel administracyjny",
    icon: (
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
          d="M9.2 5.5l.4-2.1a1 1 0 011-.8h2.8a1 1 0 011 .8l.4 2.1a6.7 6.7 0 012 .9l2-1.1a1 1 0 011.3.5l1.3 2.3a1 1 0 01-.3 1.3l-1.7 1a7.3 7.3 0 010 1.8l1.7 1a1 1 0 01.3 1.3l-1.3 2.3a1 1 0 01-1.3.5l-2-1.1a6.7 6.7 0 01-2 .9l-.4 2.1a1 1 0 01-1 .8H10.6a1 1 0 01-1-.8l-.4-2.1a6.7 6.7 0 01-2-.9l-2 1.1a1 1 0 01-1.3-.5L1.6 15a1 1 0 01.3-1.3l1.7-1a7.3 7.3 0 010-1.8l-1.7-1a1 1 0 01-.3-1.3l1.3-2.3a1 1 0 011.3-.5l2 1.1a6.7 6.7 0 012-.9z"
        />
      </svg>
    ),
    roles: ["admin", "manager"],
  },
  {
    href: "/dashboard/appointments",
    label: "Wizyty",
    icon: (
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
          d="M9.2 5.5l.4-2.1a1 1 0 011-.8h2.8a1 1 0 011 .8l.4 2.1a6.7 6.7 0 012 .9l2-1.1a1 1 0 011.3.5l1.3 2.3a1 1 0 01-.3 1.3l-1.7 1a7.3 7.3 0 010 1.8l1.7 1a1 1 0 01.3 1.3l-1.3 2.3a1 1 0 01-1.3.5l-2-1.1a6.7 6.7 0 01-2 .9l-.4 2.1a1 1 0 01-1 .8H10.6a1 1 0 01-1-.8l-.4-2.1a6.7 6.7 0 01-2-.9l-2 1.1a1 1 0 01-1.3-.5L1.6 15a1 1 0 01.3-1.3l1.7-1a7.3 7.3 0 010-1.8l-1.7-1a1 1 0 01-.3-1.3l1.3-2.3a1 1 0 011.3-.5l2 1.1a6.7 6.7 0 012-.9z"
        />
      </svg>
    ),
    roles: ["admin", "manager"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await logOut();
    // Po wylogowaniu przekieruj na stronę logowania
    window.location.href = "/signin";
  };

  if (loading || !user) {
    return (
      <aside className="bg-white w-64 border-r border-gray-200 min-h-screen flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-blue-600 text-xl border-b border-gray-100">
          FizjoCare
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-400">Ładowanie...</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="text-gray-600 px-6 py-4 text-lg font-bold text-medical-primary">
        FizjoCare
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {NAV.map(
          ({ href, label, icon, roles }) =>
            roles.includes(user.role) && (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 ${
                  pathname === href ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {icon}
                <span className="ml-2">{label}</span>
              </Link>
            )
        )}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-600 hover:text-red-800"
        >
          Wyloguj
        </button>
        <div className="mt-2 text-xs text-gray-400">
          © {new Date().getFullYear()} FizjoCare
        </div>
      </div>
    </aside>
  );
}
