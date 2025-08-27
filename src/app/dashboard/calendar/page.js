"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import { getAppointments, getServices } from "@/lib/api";
import Calendar from "@/components/ui/Calendar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AddAppointment from "@/components/modal/AddAppointment";

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: services } = useApiFetch(getServices, [], true);

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
  const [submitting, setSubmitting] = useState(false);

  const combineDateAndTime = (date, time) => {
    const [hours, minutes] = time.split(":");
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString();
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
      const aptDate = new Date(apt.scheduledDateTime);
      return (
        aptDate.getFullYear() === selectedDate.getFullYear() &&
        aptDate.getMonth() === selectedDate.getMonth() &&
        aptDate.getDate() === selectedDate.getDate()
      );
    });
  }, [appointments, selectedDate]);

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

  // const handleFormChange = (e) => {
  //   const { name, value } = e.target;
  //   setForm((prev) => ({ ...prev, [name]: value }));
  //   setFormError(null);
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setFormError(null);

  //   // Walidacja uproszczona
  //   if (
  //     !form.patient ||
  //     !form.duration ||
  //     !form.physiotherapist ||
  //     !form.service
  //   ) {
  //     setFormError("Wszystkie pola są wymagane.");
  //     return;
  //   }

  //   setSubmitting(true);
  //   const appointmentData = {
  //     patient: form.patient.value,
  //     scheduledDateTime: combineDateAndTime(
  //       form.scheduledDateTime,
  //       form.scheduledTime
  //     ),
  //     duration: form.duration,
  //     notes: form.notes,
  //     service: form.service.value,
  //     physiotherapist: form.physiotherapist.value,
  //   };

  //   const { error } = await createAppointment(appointmentData);
  //   setSubmitting(false);
  //   if (error) {
  //     setFormError(error);
  //   } else {
  //     setIsModalOpen(false);
  //     refetch();
  //   }
  // };

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

  // const handleChangeService = (val) => {
  //   const s = services.find((s) => (s._id === val.value ? s.duration : ""));
  //   setForm((f) => ({
  //     ...f,
  //     service: val,
  //     duration: s.duration,
  //   }));
  // };
  // console.log(form.scheduledDateTime);

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
                      className="border rounded px-3 py-2 flex flex-col"
                    >
                      <span className="font-medium">
                        {apt.patient
                          ? `${apt.patient.personalInfo.firstName} ${apt.patient.personalInfo.lastName}`
                          : "Nieznany pacjent"}
                      </span>
                      <span className="text-sm text-gray-700">
                        {apt.duration} • {apt.service.name}
                      </span>
                      {apt.notes && (
                        <span className="text-xs text-gray-500 mt-1">
                          {apt.notes}
                        </span>
                      )}
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
    </div>
  );
}
