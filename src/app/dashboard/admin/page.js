// src/app/dashboard/admin/page.js
"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" text="Ładowanie…" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Brak uprawnień</h1>
        <p className="text-gray-600">
          Ta sekcja jest dostępna wyłącznie dla administratorów.
        </p>
      </div>
    );
  }

  const tiles = [
    {
      href: "/dashboard/admin/users",
      title: "Zarządzanie użytkownikami",
      desc: "Dodawaj, edytuj i usuwaj konta",
      color: "blue",
    },
    {
      href: "/dashboard/admin/services",
      title: "Zarządzanie usługami",
      desc: "Twórz i edytuj usługi gabinetu",
      color: "green",
    },
    {
      href: "/dashboard/admin/permissions",
      title: "Uprawnienia",
      desc: "Role i polityki dostępu",
      color: "purple",
    },
    // {
    //   href: "/dashboard/admin/settings",
    //   title: "Ustawienia",
    //   desc: "Ustawienia globalne systemu",
    //   color: "yellow",
    // },
    {
      href: "/dashboard/admin/audit-logs",
      title: "Rejestr zdarzeń",
      desc: "Podgląd działań w systemie",
      color: "red",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-700">
          Panel administratora
        </h1>
        <p className="text-gray-600">
          Witaj, {user.firstName}! Zarządzaj globalnymi zasobami aplikacji.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href}>
            <Card hover className="group h-full">
              <Card.Content className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{tile.title}</h2>
                  <p className="text-gray-600">{tile.desc}</p>
                </div>
                <div className="mt-4">
                  <Badge color={tile.color}>Przejdź</Badge>
                </div>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <Card.Content className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Dokumentacja RODO i zgodność
              </h3>
              <p className="text-gray-600 text-sm">
                Sprawdź wytyczne dotyczące ochrony danych osobowych w sekcji
                <Link
                  href="/compliance"
                  className="text-blue-600 hover:underline ml-1"
                >
                  RODO
                </Link>
                .
              </p>
            </div>
            <Button
              onClick={() => {
                router.push("/compliance");
              }}
              className="mt-4 sm:mt-0"
            >
              Przejdź do RODO
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
