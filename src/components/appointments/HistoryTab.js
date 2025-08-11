"use client";
import { useState, useEffect } from "react";
import { getPatientAppointments } from "@/lib/api";
import AuditTimeline from "@/components/ui/AuditTimeline";

export default function HistoryTab({ patientId, appointmentsId }) {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    try {
      setLoading(true);
      loadPatientAppointments(patientId);
    } catch (err) {
      setError("Błąd ładowania wizyt pacjenta");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const loadPatientAppointments = async (patientId) => {
    try {
      const { data, error } = await getPatientAppointments(patientId);
      if (error) {
        setError(error);
      } else {
        console.log("Patient appointments:", data);
        const filteredAppointments = data?.data.filter(
          (appointment) =>
            appointment.status == "completed" &&
            appointment._id !== appointmentsId
        );
        setAppointments(filteredAppointments || []);
      }
    } catch (err) {
      setError("Błąd ładowania wizyt pacjenta");
    }
  };

  const getStatusLabel = (status) => {
    return statusLabels[status] || status;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Historia wizyt</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-500">Brak historii wizyt.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="p-4 bg-white rounded-lg shadow"
            >
              <h3 className="text-md font-semibold mb-2">
                {" "}
                Wizyta {appointment.id}
              </h3>
              <p className="text-gray-600 mb-2">
                Data:{" "}
                {new Date(appointment.scheduledDateTime).toLocaleDateString()} -{" "}
                Godzina:{" "}
                {new Date(appointment.scheduledDateTime).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
              <p className="text-gray-600 mb-2">
                Status: {getStatusLabel(appointment.status)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
