"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import { getPatients } from "@/lib/api";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Spinner from "@/components/ui/Spinner";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Link from "next/link";

export default function PatientsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useApiFetch(getPatients, [], true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie pacjentów..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Błąd ładowania pacjentów: {error}
        <Button onClick={refetch} className="ml-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  const patients = (data?.data || []).filter((p) => {
    const matchesSearch =
      search === "" ||
      `${p.personalInfo.firstName} ${p.personalInfo.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (p.personalInfo.contact.email &&
        p.personalInfo.contact.email
          .toLowerCase()
          .includes(search.toLowerCase())) ||
      (p.personalInfo.contact.phone &&
        p.personalInfo.contact.phone.includes(search));
    // status logic (jeśli masz pole isActive)
    const matchesStatus =
      status === "all" ||
      (status === "active" && p.isActive) ||
      (status === "inactive" && !p.isActive);
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: "Wszyscy" },
    { value: "active", label: "Aktywni" },
    { value: "completed", label: "Zakończeni" },
    { value: "pending", label: "Oczekujący" },
  ];

  const columns = [
    { key: "firstName", label: "Imię" },
    { key: "lastName", label: "Nazwisko" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telefon" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Akcje",
      render: (_, patient) => (
        <Link
          href={`/dashboard/patients/${patient.id}`}
          className="text-blue-600 hover:underline"
        >
          Szczegóły
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-700">Pacjenci</h1>
        <Link href="/dashboard/patients/add">
          <Button>Dodaj pacjenta</Button>
        </Link>
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Szukaj po imieniu, nazwisku, emailu lub telefonie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              options={statusOptions}
              value={status}
              onChange={(option) => setStatus(option.value)}
              placeholder="Status"
              className="max-w-xs"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatus("all");
              }}
            >
              Wyczyść filtry
            </Button>
          </div>
          <DataTable
            data={patients.map((p) => ({
              id: p.id || p._id,
              firstName: p.personalInfo.firstName,
              lastName: p.personalInfo.lastName,
              email: p.personalInfo.contact.email,
              phone: p.personalInfo.contact.phone,
              status: p.isActive ? "Aktywny" : "Nie aktywny",
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
