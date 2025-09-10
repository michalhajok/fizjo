"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import { getAppointments, getServices, updateAppointment } from "@/lib/api";
import Calendar from "@/components/ui/Calendar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AddAppointment from "@/components/modal/AddAppointment";
import CancelAppointment from "@/components/modal/CancelAppointment";
import RescheduleAppointment from "@/components/modal/RescheduleAppointment";

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

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  // const { data: services } = useApiFetch(getServices, [], true);

  const { data, loading, error, refetch } = useApiFetch(
    getAppointments,
    [],
    true
  );

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = Date.now() ? new Date(Date.now()) : new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    patient: "",
    duration: 45, // Domyślnie 45 min
    scheduledTime: "", // NOWE POLE
    notes: "",
    scheduledDateTime: selectedDate.toDateString(), // Domyślna data
    service: {},
    physiotherapist: {},
  });
  const [formError, setFormError] = useState(null);
  // const [submitting, setSubmitting] = useState(false); // Modal anulowania wizyty
  const [cancelModal, setCancelModal] = useState({
    open: false,
    appointment: null,
  });
  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointment: null,
  });
  const [cancelling, setCancelling] = useState(false);

  const combineDateAndTime = (date, time) => {
    const [hours, minutes] = time.split(":");
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString();
  };

  const handleRescheduleAppointment = async (appointment, newDateTime) => {
    setCancelling(true);
    try {
      const { error } = await updateAppointment(appointment._id, {
        scheduledDateTime: newDateTime,
      });
      if (error) {
        alert("Błąd zmiany terminu: " + error);
      } else {
        refetch();
        setRescheduleModal({ open: false, appointment: null });
      }
    } catch (e) {
      alert("Wystąpił błąd podczas zmiany terminu");
    } finally {
      setCancelling(false);
    }
  };

  // const handleTimeSelect = (time) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     scheduledTime: time,
  //     // Automatycznie ustaw pełną datę
  //   }));
  // };

  // Filtrowanie wizyt na wybrany dzień
  const appointments = data?.data || [];
  const selectedDayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (apt.status === "cancelled") return false;
      const aptDate = new Date(apt.scheduledDateTime);
      return (
        aptDate.getFullYear() === selectedDate.getFullYear() &&
        aptDate.getMonth() === selectedDate.getMonth() &&
        aptDate.getDate() === selectedDate.getDate()
      );
    });
  }, [appointments, selectedDate]);

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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleOpenModal = () => {
    setForm({
      patient: "",
      duration: "",
      notes: "",
      scheduledDateTime: selectedDate.toLocaleDateString("sv-SE"), // Ustawienie domyślnej daty
      service: {},
      physiotherapist: {},
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    refetch();
  };

  const handleCancelAppointment = async () => {
    if (!cancelModal.appointment) return;

    setCancelling(true);
    try {
      const { error } = await updateAppointmentStatus(
        cancelModal.appointment._id,
        "cancelled"
      );

      if (error) {
        alert("Błąd anulowania wizyty: " + error);
      } else {
        refetch(); // Odśwież listę wizyt
        setCancelModal({ open: false, appointment: null });
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
    return ["scheduled"].includes(appointment.status);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie kalendarza..." />
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
        <h1 className="text-2xl font-bold text-gray-700">Kalendarz wizyt</h1>
        <Button onClick={handleOpenModal}>Dodaj wizytę</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kalendarz */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Kalendarz</Card.Title>
            </Card.Header>
            <Card.Content>
              <Calendar
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                appointments={appointments}
              />
            </Card.Content>
          </Card>
        </div>

        {/* Wizyty na wybrany dzień */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title>
                Wizyty na {selectedDate.toLocaleDateString("pl-PL")}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {selectedDayAppointments.length === 0 ? (
                <div className="text-gray-500">Brak wizyt tego dnia.</div>
              ) : (
                <ul className="space-y-3">
                  {selectedDayAppointments.map((apt) => (
                    <li
                      key={apt.id || apt._id}
                      className="border rounded px-3 py-2 flex flex-wrap gap-2 items-center justify-between"
                    >
                      <span className="font-medium">
                        {apt.patient
                          ? `${apt.patient.personalInfo.firstName} ${apt.patient.personalInfo.lastName}`
                          : "Nieznany pacjent"}
                      </span>
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
                        {statusLabels[apt.status] || "Nieznany status"}
                      </span>
                      <span className="text-sm text-gray-700">
                        {apt.duration} • {apt.service.name}
                      </span>
                      {apt.notes && (
                        <span className="text-xs text-gray-500 mt-1">
                          {apt.notes}
                        </span>
                      )}
                      <div className="flex space-x-3">
                        {canCancelAppointment(apt) && (
                          <button
                            onClick={() =>
                              setCancelModal({
                                open: true,
                                appointment: apt,
                              })
                            }
                            className="text-red-600 hover:underline text-sm"
                          >
                            Anuluj
                          </button>
                        )}
                        {apt.status === "scheduled" && (
                          <button
                            className="text-yellow-600 hover:underline text-sm"
                            onClick={() =>
                              setRescheduleModal({
                                open: true,
                                appointment: apt,
                              })
                            }
                          >
                            Zmień termin
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>

      <AddAppointment
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        selectedDate={selectedDate}
      />
      <CancelAppointment
        cancelModal={cancelModal}
        setCancelModal={setCancelModal}
        handleCancelAppointment={handleCancelAppointment}
        cancelling={cancelling}
      />

      <RescheduleAppointment
        open={rescheduleModal.open}
        appointment={rescheduleModal.appointment}
        onClose={() => setRescheduleModal({ open: false, appointment: null })}
        onReschedule={handleRescheduleAppointment}
      />
    </div>
  );
}
