"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import { getAppointments, updateAppointmentStatus } from "@/lib/api";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DataTable from "@/components/ui/DataTable";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import AddAppointment from "@/components/modal/AddAppointment";

const statusOptions = [
  { value: "all", label: "Wszystkie" },
  { value: "scheduled", label: "Zaplanowana" },
  { value: "confirmed", label: "Potwierdzona" },
  { value: "completed", label: "Zakończona" },
  { value: "cancelled", label: "Anulowana" },
  { value: "no-show", label: "Nieobecność" },
];

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

export default function AppointmentsPage() {
  const today = new Date();
  today.setDate(today.getDate() + 7);
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useApiFetch(
    getAppointments,
    [],
    true
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal anulowania wizyty
  const [cancelModal, setCancelModal] = useState({
    open: false,
    appointment: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const handleCloseModal = () => setIsModalOpen(false);

  const appointments = data?.data || [];

  const filtered = appointments.filter((apt) => {
    const matchesStatus = status === "all" || apt.status === status;
    const matchesSearch =
      !search ||
      apt.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.service?.name?.toLowerCase().includes(search.toLowerCase());

    const appointmentDate = new Date(apt.scheduledDateTime);
    const afterFrom =
      !fromDate || appointmentDate >= new Date(fromDate + "T00:00");
    const beforeTo = !toDate || appointmentDate <= new Date(toDate + "T23:59");

    return matchesStatus && matchesSearch && afterFrom && beforeTo;
  });

  const handleCancelAppointment = async () => {
    if (!cancelModal.appointment) return;

    setCancelling(true);
    try {
      const { error } = await updateAppointmentStatus(
        cancelModal.appointment._id,
        "cancelled",
        cancelReason || "Anulowano przez personel"
      );

      if (error) {
        alert("Błąd anulowania wizyty: " + error);
      } else {
        refetch(); // Odśwież listę wizyt
        setCancelModal({ open: false, appointment: null });
        setCancelReason("");
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Wystąpił błąd podczas anulowania wizyty");
    } finally {
      setCancelling(false);
    }
  };

  const canCancelAppointment = (appointment) => {
    // Można anulować wizyty które nie są już zakończone, anulowane lub nie odbyły się
    return !["completed", "cancelled", "no-show"].includes(appointment.status);
  };

  const columns = [
    {
      key: "date",
      label: "Data",
      render: (_, apt) =>
        new Date(apt.scheduledDateTime).toLocaleString("pl-PL"),
    },
    {
      key: "patient",
      label: "Pacjent",
      render: (_, apt) =>
        `${apt.patient?.personalInfo?.firstName ?? "-"} ${
          apt.patient?.personalInfo?.lastName ?? ""
        }`,
    },
    {
      key: "service",
      label: "Usługa",
      render: (_, apt) => apt.service?.name || "-",
    },
    {
      key: "physiotherapist",
      label: "Fizjoterapeuta",
      render: (_, apt) =>
        `${apt.physiotherapist?.personalInfo?.firstName ?? "-"} ${
          apt.physiotherapist?.personalInfo?.lastName ?? ""
        }`,
    },
    {
      key: "status",
      label: "Status",
      render: (_, apt) => {
        const statusLabels = {
          scheduled: "Zaplanowana",
          confirmed: "Potwierdzona",
          "in-progress": "W trakcie",
          completed: "Zakończona",
          cancelled: "Anulowana",
          "no-show": "Nieobecność",
        };

        const statusLabel = statusLabels[apt.status] || apt.status;

        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              getStatusColor(apt.status) === "green"
                ? "bg-green-100 text-green-800"
                : getStatusColor(apt.status) === "blue"
                ? "bg-blue-100 text-blue-800"
                : getStatusColor(apt.status) === "red"
                ? "bg-red-100 text-red-800"
                : getStatusColor(apt.status) === "yellow"
                ? "bg-yellow-100 text-yellow-800"
                : getStatusColor(apt.status) === "purple"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {statusLabel}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Akcje",
      render: (_, apt) => (
        <div className="flex gap-2">
          {apt.status !== "cancelled" && (
            <Link
              href={`/dashboard/appointments/${apt._id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              Szczegóły
            </Link>
          )}

          {canCancelAppointment(apt) && (
            <button
              onClick={() => setCancelModal({ open: true, appointment: apt })}
              className="text-red-600 hover:underline text-sm"
            >
              Anuluj
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading || authLoading) {
    return (
      <div className="h-full flex justify-center items-center">
        <Spinner size="lg" text="Ładowanie wizyt..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Błąd ładowania wizyt: {error}
        <Button onClick={refetch} className="ml-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-700">Wizyty</h1>
        <Button onClick={() => setIsModalOpen(true)}>Dodaj wizytę</Button>
      </div>

      <Card>
        <Card.Content>
          {/* Filtry górne */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              label="Szukaj po pacjencie lub usłudze"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="date"
              label="Od"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="max-w-xs"
            />

            <Input
              type="date"
              label="Do"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="max-w-xs"
            />

            <Select
              label="Status"
              options={statusOptions}
              value={statusOptions.find((o) => o.value === status)}
              onChange={(opt) => setStatus(opt.value)}
              placeholder="Status wizyty"
              className="max-w-xs"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setFromDate(new Date().toISOString().split("T")[0]);
                setToDate(today.toISOString().split("T")[0]);
              }}
            >
              Wyczyść filtry
            </Button>
          </div>

          {/* Tabela wizyt */}
          <DataTable
            data={filtered}
            searchable={false}
            columns={columns}
            pageSize={10}
            loading={loading}
          />
        </Card.Content>
      </Card>

      {/* Modal dodawania wizyty */}
      <AddAppointment
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        selectedDate={selectedDate}
      />

      {/* Modal anulowania wizyty */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, appointment: null })}
        title="Anuluj wizytę"
      >
        <div className="space-y-4">
          {cancelModal.appointment && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-700">
                  Szczegóły wizyty:
                </h3>
                <div className="bg-gray-50 p-3 rounded-md space-y-1 text-gray-700">
                  <p>
                    <strong>Pacjent:</strong>{" "}
                    {cancelModal.appointment.patient?.personalInfo?.firstName}{" "}
                    {cancelModal.appointment.patient?.personalInfo?.lastName}
                  </p>
                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(
                      cancelModal.appointment.scheduledDateTime
                    ).toLocaleString("pl-PL")}
                  </p>
                  <p>
                    <strong>Usługa:</strong>{" "}
                    {cancelModal.appointment.service?.name}
                  </p>
                  <p>
                    <strong>Fizjoterapeuta:</strong>{" "}
                    {
                      cancelModal.appointment.physiotherapist?.personalInfo
                        ?.firstName
                    }{" "}
                    {
                      cancelModal.appointment.physiotherapist?.personalInfo
                        ?.lastName
                    }
                  </p>
                </div>
              </div>

              <Textarea
                label="Powód anulowania (opcjonalnie)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Np. choroba pacjenta, zmiana planów, problemy techniczne..."
                rows={3}
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      ⚠️ Uwaga
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Anulowanie wizyty jest operacją nieodwracalną. Upewnij
                        się, że chcesz kontynuować.
                      </p>
                      <p>
                        Pacjent powinien zostać powiadomiony o anulowaniu
                        wizyty.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCancelModal({ open: false, appointment: null })
                  }
                  disabled={cancelling}
                >
                  Nie anuluj
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {cancelling ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Anulowanie...
                    </div>
                  ) : (
                    "Anuluj wizytę"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
