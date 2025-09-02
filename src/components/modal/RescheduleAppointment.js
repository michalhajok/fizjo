"use client";

import { useState } from "react";
import useApiFetch from "@/hooks/useApiFetch";
import { getAvailableSlots } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TimeSlotPicker from "@/components/ui/TimeSlotPicker";
import Spinner from "@/components/ui/Spinner";

export default function RescheduleAppointment({
  open,
  appointment,
  onClose,
  onReschedule,
}) {
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Pobierz dostępne terminy gdy zmieni się data
  const fetchAvailableSlots = async (date) => {
    if (!date || !appointment?.physiotherapist?._id) return;

    setLoadingSlots(true);
    try {
      const { data, error } = await getAvailableSlots(
        appointment.physiotherapist._id,
        date,
        appointment.duration || 45
      );

      if (!error && data?.slots) {
        setAvailableSlots(data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const combineDateAndTime = (date, time) => {
    const [hours, minutes] = time.split(":");
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString();
  };

  // Obsłuż zmianę daty
  const handleDateChange = (date) => {
    setNewDate(date);
    setNewTime(""); // Wyczyść wybraną godzinę
    fetchAvailableSlots(date);
  };

  // Obsłuż wybór godziny
  const handleTimeSelect = (time) => {
    setNewTime(time);
  };

  // Zapisz nowy termin
  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert("Wybierz datę i godzinę");
      return;
    }

    setSaving(true);
    try {
      const dateTime = combineDateAndTime(newDate, newTime);

      await onReschedule(appointment, dateTime);
    } catch (err) {
      console.log(err);

      alert("Błąd podczas zmiany terminu");
    } finally {
      setSaving(false);
    }
  };

  // Reset przy zamknięciu
  const handleClose = () => {
    setNewDate("");
    setNewTime("");
    setAvailableSlots([]);
    onClose();
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Zmień termin wizyty"
      size="large"
    >
      <div className="space-y-6">
        {/* Informacje o wizycie */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 text-gray-700">
            Obecny termin:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-700">
                <strong>Data i godzina:</strong>
              </p>
              <p className="text-gray-700">
                {new Date(appointment.scheduledDateTime).toLocaleString(
                  "pl-PL"
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Pacjent:</strong>
              </p>
              <p className="text-gray-700">
                {appointment.patient?.personalInfo?.firstName}{" "}
                {appointment.patient?.personalInfo?.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Fizjoterapeuta:</strong>
              </p>
              <p className="text-gray-700">
                {appointment.physiotherapist?.personalInfo?.firstName}{" "}
                {appointment.physiotherapist?.personalInfo?.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Usługa:</strong>
              </p>
              <p className="text-gray-700">
                {appointment.service?.name} ({appointment.duration || 45} min)
              </p>
            </div>
          </div>
        </div>

        {/* Wybór nowej daty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nowa data
          </label>
          <Input
            type="date"
            value={newDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={new Date()} // Nie można wybrać dat z przeszłości
            className="max-w-xs"
            required
          />
        </div>

        {/* Wybór dostępnej godziny */}
        {newDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dostępne terminy dla{" "}
              {appointment.physiotherapist?.personalInfo?.firstName}{" "}
              {appointment.physiotherapist?.personalInfo?.lastName}
            </label>

            {loadingSlots ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-gray-600">
                  Sprawdzam dostępne terminy...
                </span>
              </div>
            ) : availableSlots.length > 0 ? (
              <TimeSlotPicker
                availableSlots={availableSlots}
                therapistId={appointment.physiotherapist?._id}
                serviceId={appointment.service?._id}
                selectedDate={new Date(newDate)}
                value={newTime}
                onTimeSelect={handleTimeSelect}
                duration={appointment.duration}
              />
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  📅 Brak dostępnych terminów w wybranym dniu
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Spróbuj wybrać inny dzień lub skontaktuj się z fizjoterapeutą
                </p>
              </div>
            )}
          </div>
        )}

        {/* Informacja o kolizjach */}
        {newTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-blue-400">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Nowy termin:</strong>{" "}
                  {new Date(`${newDate}T${newTime}`).toLocaleString("pl-PL")}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Upewnij się, że pacjent jest dostępny w nowym terminie
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Przyciski */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Anuluj
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={saving || !newDate || !newTime}
            loading={saving}
          >
            {saving ? "Zapisywanie..." : "Zmień termin"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
