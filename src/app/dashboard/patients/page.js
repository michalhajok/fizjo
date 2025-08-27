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

const statusOptions = [
  { value: "all", label: "Wszyscy" },
  { value: "active", label: "Aktywni" },
  { value: "inactive", label: "Nieaktywni" },
];

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

    const matchesStatus =
      status === "all" ||
      (status === "active" && p.isActive !== false) ||
      (status === "inactive" && p.isActive === false);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Brak danych";
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "Brak danych";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return `${age} lat`;
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case "M":
        return "Mężczyzna";
      case "F":
        return "Kobieta";
      case "Other":
        return "Inna";
      default:
        return "Brak danych";
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "Pacjent",
      render: (_, patient) => (
        <div>
          <div className="font-medium">
            {patient.personalInfo.firstName} {patient.personalInfo.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {calculateAge(patient.personalInfo.dateOfBirth)} •{" "}
            {getGenderLabel(patient.personalInfo.gender)}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Kontakt",
      render: (_, patient) => (
        <div>
          <div className="text-sm">{patient.personalInfo.contact.email}</div>
          <div className="text-sm text-gray-500">
            {patient.personalInfo.contact.phone}
          </div>
        </div>
      ),
    },
    {
      key: "address",
      label: "Adres",
      render: (_, patient) => {
        const addr = patient.address;
        if (!addr || (!addr.city && !addr.street)) {
          return <span className="text-gray-500">Brak adresu</span>;
        }
        return (
          <div className="text-sm">
            {addr.street && <div>{addr.street}</div>}
            <div>
              {addr.zipCode && `${addr.zipCode} `}
              {addr.city}
              {addr.state && `, ${addr.state}`}
            </div>
          </div>
        );
      },
    },
    {
      key: "medicalInfo",
      label: "Info medyczne",
      render: (_, patient) => {
        const medical = patient.medicalInfo;
        const hasInfo =
          medical &&
          (medical.allergies?.length > 0 ||
            medical.medications?.length > 0 ||
            medical.chronicConditions?.length > 0);

        if (!hasInfo) {
          return <span className="text-gray-500">Brak danych</span>;
        }

        return (
          <div className="text-xs">
            {medical.allergies?.length > 0 && (
              <div className="text-red-600">
                ⚠️ Alergie ({medical.allergies.length})
              </div>
            )}
            {medical.medications?.length > 0 && (
              <div className="text-blue-600">
                💊 Leki ({medical.medications.length})
              </div>
            )}
            {medical.chronicConditions?.length > 0 && (
              <div className="text-orange-600">
                🏥 Choroby ({medical.chronicConditions.length})
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (_, patient) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            patient.isActive !== false
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {patient.isActive !== false ? "Aktywny" : "Nieaktywny"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Dodano",
      render: (_, patient) => (
        <div className="text-sm text-gray-500">
          {formatDate(patient.createdAt)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Akcje",
      render: (_, patient) => (
        <div className="flex gap-2">
          <Link
            href={`/dashboard/patients/${patient._id}/view`}
            className="text-blue-600 hover:underline text-sm"
          >
            Podgląd
          </Link>
          <Link
            href={`/dashboard/patients/${patient._id}/edit`}
            className="text-green-600 hover:underline text-sm"
          >
            Edytuj
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Pacjenci</h1>
          <p className="text-sm text-gray-500 mt-1">
            Znaleziono {patients.length} pacjent(ów) z {data?.data?.length || 0}{" "}
            łącznie
          </p>
        </div>
        <Link href="/dashboard/patients/add">
          <Button>+ Dodaj pacjenta</Button>
        </Link>
      </div>

      {/* Filtry */}
      <Card>
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Szukaj po imieniu, nazwisku, emailu lub telefonie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="max-w-xs">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusOptions}
              />
            </div>
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
        </Card.Content>
      </Card>

      {/* Tabela pacjentów */}
      <Card>
        <Card.Content>
          {patients.length === 0 && !loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                {search || status !== "all"
                  ? "Nie znaleziono pacjentów spełniających kryteria wyszukiwania"
                  : "Brak pacjentów w systemie"}
              </div>
              {!search && status === "all" && (
                <Link href="/dashboard/patients/add">
                  <Button>Dodaj pierwszego pacjenta</Button>
                </Link>
              )}
            </div>
          ) : (
            <DataTable
              data={patients}
              columns={columns}
              pageSize={10}
              loading={loading}
            />
          )}
        </Card.Content>
      </Card>

      {/* Modal potwierdzenia usunięcia
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, patient: null })}
        title="Usuń pacjenta"
      >
        <div className="space-y-4 text-gray-700">
          <p>
            Czy na pewno chcesz usunąć pacjenta{" "}
            <strong>
              {deleteModal.patient?.personalInfo?.firstName}{" "}
              {deleteModal.patient?.personalInfo?.lastName}
            </strong>
            ?
          </p>
          <p className="text-sm text-red-600">
            ⚠️ Ta operacja jest nieodwracalna. Wszystkie dane pacjenta zostaną
            usunięte.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, patient: null })}
              disabled={deleting}
            >
              Anuluj
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePatient}
              disabled={deleting}
            >
              {deleting ? <Spinner size="sm" /> : "Usuń pacjenta"}
            </Button>
          </div>
        </div>
      </Modal> */}
    </div>
  );
}
