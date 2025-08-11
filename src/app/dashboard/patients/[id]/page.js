"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPatient,
  getPatientAppointments,
  getPatientHistory,
} from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const getStatusLabel = (status) => {
    return statusLabels[status] || status;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getPatient(id),
      getPatientAppointments(id),
      //getPatientHistory(id),
    ])
      .then(([patRes, appRes, histRes]) => {
        if (mounted) {
          setPatient(patRes.data.data || patRes.data);
          setAppointments(appRes.data?.data || []);
          // setHistory(histRes.data?.history || []);
          setError(null);
        }
      })
      .catch((err) => {
        setError("Błąd ładowania danych pacjenta");
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie danych pacjenta..." />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6 text-center text-red-600">
        {error || "Nie znaleziono pacjenta"}
        <Button onClick={() => router.back()} className="ml-4">
          Wróć
        </Button>
      </div>
    );
  }

  const {
    personalInfo,
    medicalInfo,
    physiotherapyData,
    isActive,
    consentGiven,
    consentDate,
  } = patient;

  return (
    <div className="space-y-8 p-6">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <div>
          <Badge color={isActive ? "green" : "gray"}>
            {isActive ? "Aktywny" : "Nieaktywny"}
          </Badge>
        </div>
      </div>

      {/* Dane osobowe */}
      <Card>
        <Card.Header>
          <Card.Title>Dane osobowe</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Imię:</strong> {personalInfo.firstName}
            </div>
            <div>
              <strong>Nazwisko:</strong> {personalInfo.lastName}
            </div>
            <div>
              <strong>PESEL:</strong> {personalInfo.pesel || "-"}
            </div>
            <div>
              <strong>Data urodzenia:</strong>{" "}
              {personalInfo.dateOfBirth?.slice(0, 10) || "-"}
            </div>
            <div>
              <strong>Płeć:</strong> {personalInfo.gender}
            </div>
            <div>
              <strong>Telefon:</strong> {personalInfo.contact?.phone}
            </div>
            <div>
              <strong>Email:</strong> {personalInfo.contact?.email}
            </div>
            <div>
              <strong>Zgoda RODO:</strong>{" "}
              {consentGiven ? (
                <Badge color="green">Tak</Badge>
              ) : (
                <Badge color="red">Nie</Badge>
              )}
              {consentDate && (
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(consentDate).toLocaleDateString("pl-PL")}
                </span>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Informacje medyczne */}
      <Card>
        <Card.Header>
          <Card.Title>Informacje medyczne</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Alergie:</strong>{" "}
              {medicalInfo.allergies?.length
                ? medicalInfo.allergies.join(", ")
                : "-"}
            </div>
            <div>
              <strong>Choroby przewlekłe:</strong>{" "}
              {medicalInfo.chronicConditions?.length
                ? medicalInfo.chronicConditions.join(", ")
                : "-"}
            </div>
            <div className="md:col-span-2">
              <strong>Historia medyczna:</strong>
              <ul className="list-disc ml-6">
                {medicalInfo.medicalHistory?.length ? (
                  medicalInfo.medicalHistory.map((h, i) => <li key={i}>{h}</li>)
                ) : (
                  <li>-</li>
                )}
              </ul>
            </div>
            <div className="md:col-span-2">
              <strong>Leki:</strong>
              <ul className="list-disc ml-6">
                {medicalInfo.medications?.length ? (
                  medicalInfo.medications.map((m, i) => (
                    <li key={i}>
                      {m.name} {m.dosage && `(${m.dosage})`}{" "}
                      {m.frequency && `• ${m.frequency}`}
                    </li>
                  ))
                ) : (
                  <li>-</li>
                )}
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Dane fizjoterapeutyczne */}
      <Card>
        <Card.Header>
          <Card.Title>Dane fizjoterapeutyczne</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Lekarz kierujący:</strong>{" "}
              {physiotherapyData.referringPhysician || "-"}
            </div>
            <div>
              <strong>Początkowa diagnoza:</strong>{" "}
              {physiotherapyData.initialDiagnosis || "-"}
            </div>
            <div>
              <strong>Cele terapii:</strong>{" "}
              {physiotherapyData.treatmentGoals?.length
                ? physiotherapyData.treatmentGoals.join(", ")
                : "-"}
            </div>
            <div>
              <strong>Przeciwwskazania:</strong>{" "}
              {physiotherapyData.contraindications?.length
                ? physiotherapyData.contraindications.join(", ")
                : "-"}
            </div>
            <div className="md:col-span-2">
              <strong>Uwagi specjalne:</strong>{" "}
              {physiotherapyData.specialNotes || "-"}
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Wizyty pacjenta */}
      <Card>
        <Card.Header>
          <Card.Title>Wizyty pacjenta</Card.Title>
        </Card.Header>
        <Card.Content>
          {appointments.length === 0 ? (
            <div className="text-gray-500">Brak zaplanowanych wizyt.</div>
          ) : (
            <ul className="divide-y">
              {appointments.map((apt) => (
                <li
                  key={apt._id}
                  className="py-2 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <span className="font-medium">
                      {apt.scheduledDateTime &&
                        new Date(apt.scheduledDateTime).toLocaleString("pl-PL")}
                    </span>
                    <span className="ml-2 text-gray-600">
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {apt.service?.name}
                    {apt.notes && (
                      <span className="ml-2 text-gray-500">({apt.notes})</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card.Content>
      </Card>

      {/* Historia leczenia */}
      <Card>
        <Card.Header>
          <Card.Title>Historia leczenia</Card.Title>
        </Card.Header>
        <Card.Content>
          {history.length === 0 ? (
            <div className="text-gray-500">Brak historii leczenia.</div>
          ) : (
            <ul className="divide-y">
              {history.map((h, idx) => (
                <li key={idx} className="py-2">
                  <div className="font-medium">
                    {h.date && new Date(h.date).toLocaleDateString("pl-PL")}
                  </div>
                  <div className="text-gray-700">{h.description}</div>
                </li>
              ))}
            </ul>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
