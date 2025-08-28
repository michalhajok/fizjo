"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks";
import { getPatients, getAppointments } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import { useRouter } from "next/navigation";

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
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

const getAgeGroup = (age) => {
  if (age < 18) return "0-17";
  if (age < 30) return "18-29";
  if (age < 45) return "30-44";
  if (age < 60) return "45-59";
  if (age < 75) return "60-74";
  return "75+";
};

export default function PatientsReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data states
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // rok wstecz
    dateTo: new Date().toISOString().split("T")[0],
    status: { value: "all", label: "Wszyscy pacjenci" },
    gender: { value: "all", label: "Wszystkie płcie" },
    ageGroup: { value: "all", label: "Wszystkie grupy wiekowe" },
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [patientsRes, appointmentsRes] = await Promise.all([
          getPatients(),
          getAppointments(),
        ]);

        if (patientsRes.error || appointmentsRes.error) {
          setError("Błąd ładowania danych");
          return;
        }

        setPatients(patientsRes.data?.data || []);
        setAppointments(appointmentsRes.data?.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Błąd ładowania danych");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Enhanced patients data with calculated fields
  const enhancedPatients = useMemo(() => {
    return patients.map((patient) => {
      const age = calculateAge(patient.personalInfo?.dateOfBirth);
      const ageGroup = getAgeGroup(age);

      // Znajdź wizyty tego pacjenta
      const patientAppointments = appointments.filter(
        (apt) => apt.patient?._id === patient._id || apt.patient === patient._id
      );

      // Policz wizyty w okresie filtrowania
      const appointmentsInPeriod = patientAppointments.filter((apt) => {
        const aptDate = new Date(apt.scheduledDateTime)
          .toISOString()
          .split("T")[0];
        return aptDate >= filters.dateFrom && aptDate <= filters.dateTo;
      });

      const completedAppointments = appointmentsInPeriod.filter(
        (apt) => apt.status === "completed"
      );
      const lastAppointment = patientAppointments
        .filter((apt) => apt.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.scheduledDateTime) - new Date(a.scheduledDateTime)
        )[0];

      // Określ aktywność pacjenta
      const lastAppointmentDate = lastAppointment
        ? new Date(lastAppointment.scheduledDateTime)
        : null;
      const daysSinceLastVisit = lastAppointmentDate
        ? Math.floor((new Date() - lastAppointmentDate) / (1000 * 60 * 60 * 24))
        : null;

      let activityStatus = "inactive";
      if (daysSinceLastVisit === null) {
        activityStatus = "new";
      } else if (daysSinceLastVisit <= 30) {
        activityStatus = "very-active";
      } else if (daysSinceLastVisit <= 90) {
        activityStatus = "active";
      } else if (daysSinceLastVisit <= 180) {
        activityStatus = "low-active";
      }

      return {
        ...patient,
        age,
        ageGroup,
        appointmentsCount: appointmentsInPeriod.length,
        completedAppointments: completedAppointments.length,
        lastAppointmentDate,
        daysSinceLastVisit,
        activityStatus,
        hasAllergies: patient.medicalInfo?.allergies?.length > 0,
        hasMedications: patient.medicalInfo?.medications?.length > 0,
        hasChronicConditions:
          patient.medicalInfo?.chronicConditions?.length > 0,
      };
    });
  }, [patients, appointments, filters.dateFrom, filters.dateTo]);

  // Filter patients based on current filters
  const filteredPatients = useMemo(() => {
    return enhancedPatients.filter((patient) => {
      // Status filter
      if (filters.status.value !== "all") {
        if (filters.status.value === "active" && patient.isActive !== true)
          return false;
        if (filters.status.value === "inactive" && patient.isActive !== false)
          return false;
        if (filters.status.value === "new" && patient.activityStatus !== "new")
          return false;
        if (
          filters.status.value === "very-active" &&
          patient.activityStatus !== "very-active"
        )
          return false;
      }

      // Gender filter
      if (
        filters.gender.value !== "all" &&
        patient.personalInfo?.gender !== filters.gender.value
      )
        return false;

      // Age group filter
      if (
        filters.ageGroup.value !== "all" &&
        patient.ageGroup !== filters.ageGroup.value
      )
        return false;

      return true;
    });
  }, [enhancedPatients, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredPatients.length;
    const active = filteredPatients.filter((p) => p.isActive !== false).length;
    const newPatients = filteredPatients.filter((p) => {
      const createdDate = new Date(p.createdAt);
      const periodStart = new Date(filters.dateFrom);
      return createdDate >= periodStart;
    }).length;

    // Aktywność pacjentów
    const veryActive = filteredPatients.filter(
      (p) => p.activityStatus === "very-active"
    ).length;
    const activeCount = filteredPatients.filter(
      (p) => p.activityStatus === "active"
    ).length;
    const lowActive = filteredPatients.filter(
      (p) => p.activityStatus === "low-active"
    ).length;
    const inactive = filteredPatients.filter(
      (p) => p.activityStatus === "inactive"
    ).length;
    const newCount = filteredPatients.filter(
      (p) => p.activityStatus === "new"
    ).length;

    // Demografia
    const genderStats = {
      M: filteredPatients.filter((p) => p.personalInfo?.gender === "M").length,
      F: filteredPatients.filter((p) => p.personalInfo?.gender === "F").length,
      Other: filteredPatients.filter((p) => p.personalInfo?.gender === "Other")
        .length,
    };

    const ageGroupStats = {
      "0-17": filteredPatients.filter((p) => p.ageGroup === "0-17").length,
      "18-29": filteredPatients.filter((p) => p.ageGroup === "18-29").length,
      "30-44": filteredPatients.filter((p) => p.ageGroup === "30-44").length,
      "45-59": filteredPatients.filter((p) => p.ageGroup === "45-59").length,
      "60-74": filteredPatients.filter((p) => p.ageGroup === "60-74").length,
      "75+": filteredPatients.filter((p) => p.ageGroup === "75+").length,
    };

    // Średni wiek
    const avgAge =
      total > 0
        ? Math.round(
            filteredPatients.reduce((sum, p) => sum + p.age, 0) / total
          )
        : 0;

    // Pacjenci z problemami medycznymi
    const withAllergies = filteredPatients.filter((p) => p.hasAllergies).length;
    const withMedications = filteredPatients.filter(
      (p) => p.hasMedications
    ).length;
    const withChronicConditions = filteredPatients.filter(
      (p) => p.hasChronicConditions
    ).length;

    // Średnia liczba wizyt
    const avgAppointments =
      total > 0
        ? Math.round(
            (filteredPatients.reduce((sum, p) => sum + p.appointmentsCount, 0) /
              total) *
              10
          ) / 10
        : 0;

    return {
      total,
      active,
      newPatients,
      avgAge,
      avgAppointments,
      activity: {
        veryActive,
        active: activeCount,
        lowActive,
        inactive,
        new: newCount,
      },
      demographics: { gender: genderStats, ageGroups: ageGroupStats },
      medical: { withAllergies, withMedications, withChronicConditions },
    };
  }, [filteredPatients, filters.dateFrom]);

  const handleFilterChange = (field, value) => {
    if (field === "dateFrom" || field === "dateTo") {
      setFilters((prev) => ({ ...prev, [field]: value }));
    } else {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      dateTo: new Date().toISOString().split("T")[0],
      status: { value: "all", label: "Wszyscy pacjenci" },
      gender: { value: "all", label: "Wszystkie płcie" },
      ageGroup: { value: "all", label: "Wszystkie grupy wiekowe" },
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Imię",
      "Nazwisko",
      "Płeć",
      "Wiek",
      "Grupa wiekowa",
      "Email",
      "Telefon",
      "Liczba wizyt",
      "Ostatnia wizyta",
      "Status aktywności",
      "Alergie",
      "Leki",
      "Choroby przewlekłe",
    ];

    const csvData = filteredPatients.map((patient) => [
      patient.personalInfo?.firstName || "",
      patient.personalInfo?.lastName || "",
      getGenderLabel(patient.personalInfo?.gender),
      patient.age,
      patient.ageGroup,
      patient.personalInfo?.contact?.email || "",
      patient.personalInfo?.contact?.phone || "",
      patient.appointmentsCount,
      patient.lastAppointmentDate
        ? new Date(patient.lastAppointmentDate).toLocaleDateString("pl-PL")
        : "Brak",
      patient.activityStatus,
      patient.hasAllergies ? "Tak" : "Nie",
      patient.hasMedications ? "Tak" : "Nie",
      patient.hasChronicConditions ? "Tak" : "Nie",
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
      `raport-pacjentow-${filters.dateFrom}-${filters.dateTo}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActivityColor = (status) => {
    const colors = {
      "very-active": "green",
      active: "blue",
      "low-active": "yellow",
      inactive: "red",
      new: "purple",
    };
    return colors[status] || "gray";
  };

  const getActivityLabel = (status) => {
    const labels = {
      "very-active": "Bardzo aktywny",
      active: "Aktywny",
      "low-active": "Mało aktywny",
      inactive: "Nieaktywny",
      new: "Nowy pacjent",
    };
    return labels[status] || "Nieznany";
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

  // Options dla selectów
  const statusOptions = [
    { value: "all", label: "Wszyscy pacjenci" },
    { value: "active", label: "Aktywni" },
    { value: "inactive", label: "Nieaktywni" },
    { value: "new", label: "Nowi pacjenci" },
    { value: "very-active", label: "Bardzo aktywni" },
  ];

  const genderOptions = [
    { value: "all", label: "Wszystkie płcie" },
    { value: "M", label: "Mężczyźni" },
    { value: "F", label: "Kobiety" },
    { value: "Other", label: "Inna" },
  ];

  const ageGroupOptions = [
    { value: "all", label: "Wszystkie grupy wiekowe" },
    { value: "0-17", label: "0-17 lat" },
    { value: "18-29", label: "18-29 lat" },
    { value: "30-44", label: "30-44 lata" },
    { value: "45-59", label: "45-59 lat" },
    { value: "60-74", label: "60-74 lata" },
    { value: "75+", label: "75+ lat" },
  ];

  const tableColumns = [
    {
      key: "patient",
      label: "Pacjent",
      render: (_, patient) => (
        <div>
          <div className="font-medium">
            {patient.personalInfo?.firstName} {patient.personalInfo?.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {patient.age} lat • {getGenderLabel(patient.personalInfo?.gender)}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Kontakt",
      render: (_, patient) => (
        <div>
          <div className="text-sm">{patient.personalInfo?.contact?.email}</div>
          <div className="text-sm text-gray-500">
            {patient.personalInfo?.contact?.phone}
          </div>
        </div>
      ),
    },
    {
      key: "appointments",
      label: "Wizyty",
      render: (_, patient) => (
        <div>
          <div className="font-medium">{patient.appointmentsCount} wizyt</div>
          <div className="text-sm text-gray-500">
            {patient.completedAppointments} zakończonych
          </div>
        </div>
      ),
    },
    {
      key: "lastVisit",
      label: "Ostatnia wizyta",
      render: (_, patient) => (
        <div>
          {patient.lastAppointmentDate ? (
            <>
              <div className="text-sm">
                {new Date(patient.lastAppointmentDate).toLocaleDateString(
                  "pl-PL"
                )}
              </div>
              <div className="text-xs text-gray-500">
                {patient.daysSinceLastVisit} dni temu
              </div>
            </>
          ) : (
            <span className="text-gray-500 text-sm">Brak wizyt</span>
          )}
        </div>
      ),
    },
    {
      key: "activity",
      label: "Aktywność",
      render: (_, patient) => (
        <Badge color={getActivityColor(patient.activityStatus)}>
          {getActivityLabel(patient.activityStatus)}
        </Badge>
      ),
    },
    // {
    //   key: "medical",
    //   label: "Info medyczne",
    //   render: (_, patient) => (
    //     <div className="text-xs">
    //       {patient.hasAllergies && (
    //         <div className="text-red-600">⚠️ Alergie</div>
    //       )}
    //       {patient.hasMedications && (
    //         <div className="text-blue-600">💊 Leki</div>
    //       )}
    //       {patient.hasChronicConditions && (
    //         <div className="text-orange-600">🏥 Choroby</div>
    //       )}
    //       {!patient.hasAllergies &&
    //         !patient.hasMedications &&
    //         !patient.hasChronicConditions && (
    //           <span className="text-gray-500">Brak</span>
    //         )}
    //     </div>
    //   ),
    // },
    {
      key: "status",
      label: "Status",
      render: (_, patient) => (
        <Badge color={patient.isActive !== false ? "green" : "red"}>
          {patient.isActive !== false ? "Aktywny" : "Nieaktywny"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-2">
      {/* Nagłówek */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Raport pacjentów</h1>
          <p className="text-gray-600">
            Analiza demograficzna i aktywności pacjentów
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
              label="Płeć"
              value={filters.gender}
              onChange={(value) => handleFilterChange("gender", value)}
              options={genderOptions}
            />
            <Select
              label="Grupa wiekowa"
              value={filters.ageGroup}
              onChange={(value) => handleFilterChange("ageGroup", value)}
              options={ageGroupOptions}
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

      {/* Główne statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Łączna liczba pacjentów
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                👥
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Nowi pacjenci
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.newPatients}
                </p>
                <p className="text-xs text-gray-500">w wybranym okresie</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                ✨
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Średni wiek</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avgAge}
                </p>
                <p className="text-xs text-gray-500">lat</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                📊
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Średnia wizyt
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.avgAppointments}
                </p>
                <p className="text-xs text-gray-500">na pacjenta</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                📅
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Statystyki aktywności i demografii */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktywność pacjentów */}
        <Card>
          <Card.Header>
            <Card.Title>Aktywność pacjentów</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bardzo aktywni (≤30 dni)</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.activity.veryActive / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.activity.veryActive}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Aktywni (31-90 dni)</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.activity.active / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.activity.active}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mało aktywni (91-180 dni)</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.activity.lowActive / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.activity.lowActive}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{"Nieaktywni (>180 dni)"}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.activity.inactive / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.activity.inactive}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Nowi pacjenci</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.activity.new / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.activity.new}
                  </span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Demografia - płeć */}
        <Card>
          <Card.Header>
            <Card.Title>Rozkład według płci</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Kobiety</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.demographics.gender.F / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.demographics.gender.F}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mężczyźni</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.demographics.gender.M / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.demographics.gender.M}
                  </span>
                </div>
              </div>
              {stats.demographics.gender.Other > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inna</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full"
                        style={{
                          width: `${
                            stats.total > 0
                              ? (stats.demographics.gender.Other /
                                  stats.total) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {stats.demographics.gender.Other}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Problemy medyczne */}
        <Card>
          <Card.Header>
            <Card.Title>Problemy medyczne</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-sm">Alergie</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {stats.medical.withAllergies}
                  </span>
                  <span className="text-xs text-gray-500">
                    (
                    {stats.total > 0
                      ? Math.round(
                          (stats.medical.withAllergies / stats.total) * 100
                        )
                      : 0}
                    %)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">💊</span>
                  <span className="text-sm">Przyjmują leki</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {stats.medical.withMedications}
                  </span>
                  <span className="text-xs text-gray-500">
                    (
                    {stats.total > 0
                      ? Math.round(
                          (stats.medical.withMedications / stats.total) * 100
                        )
                      : 0}
                    %)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">🏥</span>
                  <span className="text-sm">Choroby przewlekłe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {stats.medical.withChronicConditions}
                  </span>
                  <span className="text-xs text-gray-500">
                    (
                    {stats.total > 0
                      ? Math.round(
                          (stats.medical.withChronicConditions / stats.total) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Tabela pacjentów */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>Lista pacjentów ({filteredPatients.length})</Card.Title>
            <span className="text-sm text-gray-500">
              Okres: {filters.dateFrom} - {filters.dateTo}
            </span>
          </div>
        </Card.Header>
        <Card.Content>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Brak pacjentów spełniających kryteria filtrowania
              </div>
              <Button variant="outline" onClick={resetFilters}>
                Resetuj filtry
              </Button>
            </div>
          ) : (
            <DataTable
              data={filteredPatients}
              columns={tableColumns}
              pageSize={15}
            />
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
