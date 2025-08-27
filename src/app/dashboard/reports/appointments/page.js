"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks";
import { getAppointments, getServices, getPhysiotherapists } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import { useRouter } from "next/navigation";

const statusLabels = {
  scheduled: "Zaplanowana",
  confirmed: "Potwierdzona",
  "checked-in": "Przyjęty",
  "in-progress": "W trakcie",
  completed: "Zakończona",
  cancelled: "Anulowana",
  "no-show": "Nieobecność",
  rescheduled: "Przełożona",
};

const getStatusColor = (status) => {
  const colors = {
    scheduled: "blue",
    confirmed: "green",
    "checked-in": "purple",
    "in-progress": "yellow",
    completed: "green",
    cancelled: "red",
    "no-show": "red",
    rescheduled: "orange",
  };
  return colors[status] || "gray";
};

export default function AppointmentsReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states - zaktualizowane do object structure
  const [filters, setFilters] = useState({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
    status: { value: "all", label: "Wszystkie statusy" },
    therapist: { value: "all", label: "Wszyscy fizjoterapeuci" },
    service: { value: "all", label: "Wszystkie usługi" },
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, servicesRes, therapistsRes] = await Promise.all(
          [getAppointments(), getServices(), getPhysiotherapists()]
        );

        if (appointmentsRes.error || servicesRes.error || therapistsRes.error) {
          setError("Błąd ładowania danych");
          return;
        }

        setAppointments(appointmentsRes.data?.data || []);
        setServices(servicesRes.data?.data || []);
        setTherapists(therapistsRes.data?.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Błąd ładowania danych");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledDateTime)
        .toISOString()
        .split("T")[0];

      // Date range filter
      if (filters.dateFrom && aptDate < filters.dateFrom) return false;
      if (filters.dateTo && aptDate > filters.dateTo) return false;

      // Status filter - używamy .value z obiektu
      if (filters.status.value !== "all" && apt.status !== filters.status.value)
        return false;

      // Therapist filter - używamy .value z obiektu
      if (
        filters.therapist.value !== "all" &&
        apt.physiotherapist?._id !== filters.therapist.value
      )
        return false;

      // Service filter - używamy .value z obiektu
      if (
        filters.service.value !== "all" &&
        apt.service?._id !== filters.service.value
      )
        return false;

      return true;
    });
  }, [appointments, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const cancelled = filteredAppointments.filter(
      (apt) => apt.status === "cancelled" || apt.status === "no-show"
    ).length;

    // Calculate revenue (assuming service has price field)
    const revenue = filteredAppointments
      .filter((apt) => apt.status === "completed")
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

    // Calculate average duration
    const completedWithDuration = filteredAppointments.filter(
      (apt) => apt.status === "completed" && apt.duration
    );
    const avgDuration =
      completedWithDuration.length > 0
        ? completedWithDuration.reduce((sum, apt) => sum + apt.duration, 0) /
          completedWithDuration.length
        : 0;

    // Find top service
    const serviceCount = {};
    filteredAppointments.forEach((apt) => {
      if (apt.service?.name) {
        serviceCount[apt.service.name] =
          (serviceCount[apt.service.name] || 0) + 1;
      }
    });
    const topServiceEntry = Object.entries(serviceCount).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Find top therapist
    const therapistCount = {};
    filteredAppointments.forEach((apt) => {
      if (apt.physiotherapist?.personalInfo) {
        const name = `${apt.physiotherapist.personalInfo.firstName} ${apt.physiotherapist.personalInfo.lastName}`;
        therapistCount[name] = (therapistCount[name] || 0) + 1;
      }
    });
    const topTherapistEntry = Object.entries(therapistCount).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      total,
      completed,
      cancelled,
      revenue,
      avgDuration: Math.round(avgDuration),
      topService: topServiceEntry
        ? { name: topServiceEntry[0], count: topServiceEntry[1] }
        : null,
      topTherapist: topTherapistEntry
        ? { name: topTherapistEntry[0], count: topTherapistEntry[1] }
        : null,
    };
  }, [filteredAppointments]);

  // Aktualizowana funkcja obsługi zmian filtrów
  const handleFilterChange = (field, value) => {
    if (field === "dateFrom" || field === "dateTo") {
      // Dla dat - proste string values
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      // Dla selectów - object values {value, label}
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      dateTo: new Date().toISOString().split("T")[0],
      status: { value: "all", label: "Wszystkie statusy" },
      therapist: { value: "all", label: "Wszyscy fizjoterapeuci" },
      service: { value: "all", label: "Wszystkie usługi" },
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Data",
      "Godzina",
      "Pacjent",
      "Fizjoterapeuta",
      "Usługa",
      "Status",
      "Czas trwania",
      "Notatki",
    ];

    const csvData = filteredAppointments.map((apt) => [
      new Date(apt.scheduledDateTime).toLocaleDateString("pl-PL"),
      new Date(apt.scheduledDateTime).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      apt.patient?.personalInfo
        ? `${apt.patient.personalInfo.firstName} ${apt.patient.personalInfo.lastName}`
        : "Brak danych",
      apt.physiotherapist?.personalInfo
        ? `${apt.physiotherapist.personalInfo.firstName} ${apt.physiotherapist.personalInfo.lastName}`
        : "Brak danych",
      apt.service?.name || "Brak danych",
      statusLabels[apt.status] || apt.status,
      `${apt.duration || 0} min`,
      apt.notes || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `raport-wizyt-${filters.dateFrom}-${filters.dateTo}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie raportu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
        <Button onClick={() => window.location.reload()} className="ml-4">
          Odśwież stronę
        </Button>
      </div>
    );
  }

  // Options dla selectów - zaktualizowane do object structure
  const statusOptions = [
    { value: "all", label: "Wszystkie statusy" },
    ...Object.entries(statusLabels).map(([key, label]) => ({
      value: key,
      label,
    })),
  ];

  const therapistOptions = [
    { value: "all", label: "Wszyscy fizjoterapeuci" },
    ...therapists.map((t) => ({
      value: t._id,
      label: `${t.personalInfo?.firstName || ""} ${
        t.personalInfo?.lastName || ""
      }`.trim(),
    })),
  ];

  const serviceOptions = [
    { value: "all", label: "Wszystkie usługi" },
    ...services.map((s) => ({
      value: s._id,
      label: s.name,
    })),
  ];

  const tableColumns = [
    {
      key: "date",
      label: "Data i godzina",
      render: (_, apt) => (
        <div>
          <div className="font-medium">
            {new Date(apt.scheduledDateTime).toLocaleDateString("pl-PL")}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(apt.scheduledDateTime).toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "patient",
      label: "Pacjent",
      render: (_, apt) =>
        apt.patient?.personalInfo
          ? `${apt.patient.personalInfo.firstName} ${apt.patient.personalInfo.lastName}`
          : "Brak danych",
    },
    {
      key: "therapist",
      label: "Fizjoterapeuta",
      render: (_, apt) =>
        apt.physiotherapist?.personalInfo
          ? `${apt.physiotherapist.personalInfo.firstName} ${apt.physiotherapist.personalInfo.lastName}`
          : "Brak danych",
    },
    {
      key: "service",
      label: "Usługa",
      render: (_, apt) => (
        <div>
          <div>{apt.service?.name || "Brak danych"}</div>
          <div className="text-sm text-gray-500">{apt.duration || 0} min</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, apt) => (
        <Badge color={getStatusColor(apt.status)}>
          {statusLabels[apt.status] || apt.status}
        </Badge>
      ),
    },
    {
      key: "notes",
      label: "Notatki",
      render: (_, apt) => (
        <div className="max-w-xs truncate text-sm text-gray-600">
          {apt.notes || "-"}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Nagłówek */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Raport wizyt</h1>
          <p className="text-gray-600">
            Przegląd i analiza wizyt w wybranym okresie
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          ← Powrót do raportów
        </Button>
      </div>

      {/* Filtry */}
      <Card>
        <Card.Header>
          <Card.Title>Filtry</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input
              label="Data od"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
            <Input
              label="Data do"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              options={statusOptions}
            />
            <Select
              label="Fizjoterapeuta"
              value={filters.therapist}
              onChange={(value) => handleFilterChange("therapist", value)}
              options={therapistOptions}
            />
            <Select
              label="Usługa"
              value={filters.service}
              onChange={(value) => handleFilterChange("service", value)}
              options={serviceOptions}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              Resetuj filtry
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              📊 Eksportuj CSV
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Łączna liczba wizyt
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                📅
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Wizyty zakończone
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  % wszystkich
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                ✅
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Wizyty odwołane
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0
                    ? Math.round((stats.cancelled / stats.total) * 100)
                    : 0}
                  % wszystkich
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                ❌
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Średni czas wizyty
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avgDuration}
                </p>
                <p className="text-xs text-gray-500">minut</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                ⏱️
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Dodatkowe statystyki */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Najpopularniejsza usługa</Card.Title>
          </Card.Header>
          <Card.Content>
            {stats.topService ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">{stats.topService.name}</p>
                  <p className="text-sm text-gray-600">
                    {stats.topService.count} wizyt
                  </p>
                </div>
                <div className="text-2xl">🏆</div>
              </div>
            ) : (
              <p className="text-gray-500">Brak danych</p>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Najbardziej aktywny fizjoterapeuta</Card.Title>
          </Card.Header>
          <Card.Content>
            {stats.topTherapist ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">
                    {stats.topTherapist.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {stats.topTherapist.count} wizyt
                  </p>
                </div>
                <div className="text-2xl">👨‍⚕️</div>
              </div>
            ) : (
              <p className="text-gray-500">Brak danych</p>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Tabela wizyt */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Lista wizyt ({filteredAppointments.length})</Card.Title>
            <span className="text-sm text-gray-500">
              {filters.dateFrom} - {filters.dateTo}
            </span>
          </div>
        </Card.Header>
        <Card.Content>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Brak wizyt spełniających kryteria filtrowania
              </div>
              <Button variant="outline" onClick={resetFilters}>
                Resetuj filtry
              </Button>
            </div>
          ) : (
            <DataTable
              data={filteredAppointments}
              columns={tableColumns}
              pageSize={15}
            />
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
