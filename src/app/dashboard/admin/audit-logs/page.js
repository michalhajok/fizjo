// src/app/dashboard/admin/audit-logs/page.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import { getAuditLogs } from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function AuditLogsPage() {
  const { user, loading: authLoading } = useAuth();
  //const { data, loading, error, refetch } = useApiFetch(getAuditLogs, [], true);

  const [filterAction, setFilterAction] = useState("all");
  const [filterUser, setFilterUser] = useState("");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      getAuditLogs()
        .then(({ data, error }) => {
          if (error) setError(error);
          else setLogs(data.data); // zakładamy, że backend zwraca gotowy obiekt
        })
        .finally(() => setLoading(false));
    } else if (!authLoading && user?.role !== "admin") {
      router.replace("/dashboard"); // brak uprawnień
    }
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" text="Ładowanie logów…" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Brak uprawnień</h1>
        <p className="text-gray-600">
          Sekcja dostępna tylko dla administratorów.
        </p>
      </div>
    );
  }

  //const logs = data?.data || [];

  console.log("Audit logs data:", logs);

  const filtered = logs.filter((log) => {
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesUser =
      !filterUser ||
      `${log.userId?.firstName} ${log.userId?.lastName}`
        .toLowerCase()
        .includes(filterUser.toLowerCase());
    const matchesSearch =
      !search || log.description.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesUser && matchesSearch;
  });

  const actionOptions = [
    { value: "all", label: "Wszystkie" },
    ...Array.from(new Set(logs.map((l) => l.action))).map((act) => ({
      value: act,
      label: act,
    })),
  ];

  console.log(filtered[0]?.userId.firstName);

  const columns = [
    { key: "timestamp", label: "Data i czas" },
    {
      key: "user",
      label: "Użytkownik",
    },
    { key: "action", label: "Akcja" },
    { key: "description", label: "Opis" },
    { key: "ip", label: "Adres IP" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-700">Rejestr zdarzeń</h1>
        <Button onClick={refetch}>Odśwież</Button>
      </header> */}

      <Card>
        <Card.Content className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Szukaj w opisie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full md:w-1/3"
            />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="border p-2 rounded w-full md:w-1/4"
            >
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Filtruj użytkownika…"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="border p-2 rounded w-full md:w-1/3"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content>
          <DataTable
            data={filtered.map((log) => ({
              timestamp: new Date(log.createdAt).toLocaleString("pl-PL"),
              user: `${log.userId?.firstName || ""} ${
                log.userId?.lastName || ""
              }`,
              action: log.action,
              description: log.details,
              ip: log.ipAddress || "-",
            }))}
            columns={columns}
            pageSize={10}
            loading={loading}
          />
        </Card.Content>
      </Card>
    </div>
  );
}
