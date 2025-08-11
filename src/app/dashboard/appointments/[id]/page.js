"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAppointment,
  getIcd9Procedures,
  updateAppointment,
  updateAppointmentStatus,
  signAppointment,
  getTemplates,
  applyTemplate,
} from "@/lib/api";

import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

import InterviewTab from "@/components/appointments/InterviewTab";
import ExaminationsTab from "@/components/appointments/ExaminationsTab";
import PlanTab from "@/components/appointments/PlanTab";
import CourseTab from "@/components/appointments/CourseTab";
import DiagnosesTab from "@/components/appointments/DiagnosesTab";
import AssessmentScalesTab from "@/components/appointments/AssessmentScalesTab";
import HistoryTab from "@/components/appointments/HistoryTab";

const statusColors = {
  scheduled: "blue",
  confirmed: "green",
  "checked-in": "yellow",
  "in-progress": "orange",
  completed: "green",
  cancelled: "red",
  "no-show": "red",
  rescheduled: "purple",
};

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

const tabs = [
  { value: "interview", label: "Wywiad" },
  { value: "examinations", label: "Badania" },
  { value: "scales", label: "Skale oceny" },
  { value: "diagnoses", label: "Rozpoznania" },
  { value: "plan", label: "Plan leczenia" },
  { value: "course", label: "Przebieg" },
  { value: "history", label: "Historia" },
];

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("interview");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);

  // Szablon i procedury
  const [templates, setTemplates] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Ładowanie danych
  useEffect(() => {
    loadAppointment();
    loadTemplates();
    loadProcedures();
  }, [id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAppointment(id);
      if (error) {
        setError(error);
      } else {
        setAppointment(data?.data);
      }
    } catch (err) {
      setError("Błąd ładowania wizyty");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data } = await getTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error("Error loading templates:", err);
    }
  };

  const loadProcedures = async () => {
    try {
      const { data } = await getIcd9Procedures();
      setProcedures(data?.data || []);
    } catch (err) {
      console.error("Error loading procedures:", err);
    }
  };

  // Zmiana statusu
  const handleStatusChange = async (newStatus, reason = "") => {
    try {
      setSaving(true);
      const { data, error } = await updateAppointmentStatus(id, {
        status: newStatus,
        reason,
      });
      if (error) {
        setError(error);
      } else {
        console.log("Updated appointment data:", data);

        setAppointment(data?.data);
      }
    } catch (err) {
      setError("Błąd aktualizacji statusu");
    } finally {
      setSaving(false);
    }
  };

  // Zastosowanie szablonu
  const handleApplyTemplate = async (templateId) => {
    try {
      setSaving(true);
      const { data, error } = await applyTemplate(id, { templateId });
      if (error) {
        setError(error);
      } else {
        setAppointment(data.appointment);
        setSelectedTemplate(data.template);
      }
    } catch (err) {
      setError("Błąd stosowania szablonu");
    } finally {
      setSaving(false);
    }
  };

  // Cyfrowy podpis
  const handleSign = async () => {
    try {
      setSaving(true);
      // Wygeneruj hash z danych dokumentacji (w prawdziwej implementacji użyj odpowiedniej biblioteki)
      const signatureHash = btoa(
        JSON.stringify({
          appointmentId: id,
          timestamp: new Date().toISOString(),
          userId: "current_user_id", // Pobierz z kontekstu
        })
      );

      const { data, error } = await signAppointment(id, { signatureHash });
      if (error) {
        setError(error);
      } else {
        setAppointment(data?.data);
      }
    } catch (err) {
      setError("Błąd podpisywania dokumentacji");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAppointment = (updatedData) => {
    setSaving(true);
    updateAppointment(id, updatedData)
      .then(({ data, error }) => {
        if (error) {
          setError(error);
        } else {
          setAppointment(data?.data);
        }
      })
      .catch((err) => {
        setError("Błąd aktualizacji wizyty");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie wizyty..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <Button onClick={loadAppointment} className="mt-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6 text-center">
        <p>Wizyta nie została znaleziona</p>
        <Button onClick={() => router.back()} className="mt-4">
          Powrót
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header wizyty */}
      <Card>
        <Card.Content>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Wizyta -{" "}
                {new Date(appointment.scheduledDateTime).toLocaleString(
                  "pl-PL"
                )}
              </h1>
              <div className="space-y-1">
                <p>
                  <strong>Pacjent:</strong>{" "}
                  {appointment.patient?.personalInfo.firstName}{" "}
                  {appointment.patient?.personalInfo.lastName}
                </p>
                <p>
                  <strong>Terapeuta:</strong>{" "}
                  {appointment.physiotherapist?.personalInfo.firstName}{" "}
                  {appointment.physiotherapist?.personalInfo.lastName}
                </p>
                <p>
                  <strong>Usługa:</strong> {appointment?.service?.name}
                </p>
                <p>
                  <strong>Czas trwania:</strong> {appointment.duration} min
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge color={statusColors[appointment.status]}>
                {statusLabels[appointment.status]}
              </Badge>
              {appointment.appointmentType !== "scheduled" && (
                <Badge color="purple">{appointment.appointmentType}</Badge>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Pasek akcji */}
      <Card>
        <Card.Content>
          <div className="flex flex-wrap gap-2">
            {/* Przyciski zmiany statusu */}
            {appointment.status === "scheduled" && (
              <Button
                size="sm"
                onClick={() => handleStatusChange("confirmed")}
                disabled={saving}
              >
                Potwierdź
              </Button>
            )}
            {appointment.status === "confirmed" && (
              <Button
                size="sm"
                onClick={() => handleStatusChange("checked-in")}
                disabled={saving}
              >
                Przyjmij pacjenta
              </Button>
            )}
            {appointment.status === "checked-in" && (
              <Button
                size="sm"
                onClick={() => handleStatusChange("in-progress")}
                disabled={saving}
              >
                Rozpocznij wizytę
              </Button>
            )}

            {/* Szablon */}
            {templates.length > 0 && !appointment.template && (
              <select
                className="px-3 py-1 border rounded text-sm"
                onChange={(e) =>
                  e.target.value && handleApplyTemplate(e.target.value)
                }
                disabled={saving}
              >
                <option value="">Zastosuj szablon...</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}

            {/* Podpis cyfrowy */}
            {appointment.status === "in-progress" &&
              !appointment.digitalSignature && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={handleSign}
                  disabled={saving}
                >
                  Podpisz i zakończ
                </Button>
              )}

            {appointment.digitalSignature && (
              <div className="text-sm text-green-600">
                ✓ Podpisano przez{" "}
                {appointment.digitalSignature.signedBy.firstName}{" "}
                {appointment.digitalSignature.signedBy.lastName}
                <br />
                {new Date(appointment.digitalSignature.signedAt).toLocaleString(
                  "pl-PL"
                )}
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Zakładki */}
      <Card>
        <div className="border-b">
          <Tabs value={activeTab} onChange={setActiveTab} tabs={tabs} />
        </div>

        <Card.Content>
          {activeTab === "interview" && (
            <InterviewTab
              appointment={appointment}
              onUpdate={handleUpdateAppointment}
            />
          )}

          {activeTab === "scales" && (
            <AssessmentScalesTab
              appointment={appointment}
              onUpdate={(scales) => {
                // Implementuj aktualizację skal oceny
              }}
            />
          )}

          {activeTab === "diagnoses" && (
            <DiagnosesTab
              appointment={appointment}
              onUpdate={handleUpdateAppointment}
            />
          )}

          {activeTab === "examinations" && (
            <ExaminationsTab
              appointment={appointment}
              onUpdate={handleUpdateAppointment}
            />
          )}

          {activeTab === "plan" && (
            <PlanTab
              appointment={appointment}
              onUpdate={handleUpdateAppointment}
            />
          )}

          {activeTab === "course" && (
            <CourseTab
              appointment={appointment}
              procedures={procedures}
              onUpdate={handleUpdateAppointment}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab
              patientId={appointment?.patient._id}
              appointmentsId={appointment._id}
            />
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
