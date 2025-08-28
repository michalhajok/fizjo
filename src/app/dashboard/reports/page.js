// src/app/dashboard/reports/page.js
"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";

const reportTiles = [
  {
    href: "/dashboard/reports/appointments",
    title: "Raport wizyt",
    desc: "Statystyki, liczba wizyt, przychody, typy usług",
    color: "blue",
  },
  {
    href: "/dashboard/reports/patients",
    title: "Raport pacjentów",
    desc: "Nowi pacjenci, aktywność, demografia",
    color: "green",
  },
  // {
  //   href: "/dashboard/reports/clinical",
  //   title: "Raport kliniczny",
  //   desc: "Postępy terapii, wyniki badań, efekty leczenia",
  //   color: "purple",
  // },
  // {
  //   href: "/dashboard/reports/exports",
  //   title: "Eksport danych",
  //   desc: "Eksportuj dane do CSV, PDF lub XLSX",
  //   color: "yellow",
  // },
];

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" text="Ładowanie raportów…" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2 text-gray-700">Raporty</h1>
        <p className="text-gray-600">
          Wybierz raport, który chcesz przeanalizować lub wyeksportować.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTiles.map((tile) => (
          <Link key={tile.href} href={tile.href}>
            <Card hover className="group h-full">
              <Card.Content className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{tile.title}</h2>
                  <p className="text-gray-600">{tile.desc}</p>
                </div>
                <div className="mt-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${tile.color}-100 text-${tile.color}-700 group-hover:bg-${tile.color}-200`}
                  >
                    Przejdź
                  </span>
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
                Potrzebujesz raportu niestandardowego?
              </h3>
              <p className="text-gray-600 text-sm">
                Skontaktuj się z administratorem lub napisz na{" "}
                <a
                  href="mailto:support@twojgabinet.pl"
                  className="text-blue-600 hover:underline"
                >
                  support@twojgabinet.pl
                </a>
                .
              </p>
            </div>
            <Button
              onClick={() => {
                router.push("/dashboard");
              }}
              variant="outline"
              className="mt-4 sm:mt-0"
            >
              Powrót do panelu
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
