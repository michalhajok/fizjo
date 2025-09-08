// /src/app/dashboard/appointments/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAppointment,
  getIcd9Procedures,
  updateAppointment,
  updateAppointmentStatus,
  signAppointment,
  getICFAssessment,
  saveICFAssessment,
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
// import AssessmentScalesTab from "@/components/appointments/AssessmentScalesTab";
import HistoryTab from "@/components/appointments/HistoryTab";
import ICFAssessment from "@/components/appointments/ICFAssessment";

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
  { value: "icf_assessment", label: "Ocena ICF" }, // NOWA ZAKŁADKA
  { value: "examinations", label: "Badania" },
  // { value: "scales", label: "Skale oceny" },
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
  const [icfData, setIcfData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Szablon i procedury
  const [procedures, setProcedures] = useState([]);

  // Ładowanie danych
  useEffect(() => {
    loadAppointment();
    loadProcedures();
  }, [id]);

  useEffect(() => {
    loadICF();
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

  const loadICF = async () => {
    try {
      // Pobierz ocenę ICF dla tej wizyty

      setLoading2(true);
      const { data, error } = await getICFAssessment(id);

      if (!error && data?.data) {
        setIcfData(data.data);
      }
    } catch (err) {
      console.error("Error loading ICF:", err);
    } finally {
      setLoading2(false);
    }
  };

  const handleICFSave = async (icfData) => {
    try {
      setSaving(true);

      // Wywołaj API zapisujące ocenę ICF
      const { data, error } = await saveICFAssessment(id, {
        coreSet: icfData.coreSet,
        body_functions: icfData.body_functions,
        body_structures: icfData.body_structures,
        activities_participation: icfData.activities_participation,
        environmental_factors: icfData.environmental_factors,
        assessmentDate: icfData.assessmentDate,
        additionalNotes: icfData.additionalNotes,
        status: "completed",
      });

      if (error) {
        return;
      }

      // Zaktualizuj lokalny stan wizyty z nowymi danymi ICF
      setAppointment((prev) => ({
        ...prev,
        icfAssessment: {
          completed: true,
          data: icfData,
          lastUpdated: new Date().toISOString(),
          assessmentId: data.data._id,
        },
      }));
    } catch (err) {
      console.error("Błąd zapisu ICF:", err);
    } finally {
      setSaving(false);
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
      const { data, error } = await updateAppointmentStatus(id, newStatus);
      if (error) {
        setError(error);
      } else {
        setAppointment(data?.data);
      }
    } catch (err) {
      setError("Błąd aktualizacji statusu");
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

  if (loading2) {
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
                {appointment.digitalSignature?.signedBy?.firstName}{" "}
                {appointment.digitalSignature?.signedBy?.lastName}
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

          {/* {activeTab === "scales" && (
            <AssessmentScalesTab
              appointment={appointment}
              onUpdate={(scales) => {
                // Implementuj aktualizację skal oceny
              }}
            />
          )} */}

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
          {activeTab === "icf_assessment" && (
            <ICFAssessment
              patientId={appointment.patient._id}
              appointmentId={appointment._id}
              // initialData={appointment.icfAssessment?.data || {}}
              initialData={icfData || {}}
              onSave={handleICFSave}
              // readOnly={appointment.status === "completed"}
              readOnly={false}
            />
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
