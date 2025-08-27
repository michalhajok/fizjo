"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPatient, getPatientAppointments } from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import AddAppointment from "@/components/modal/AddAppointment";

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
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

  const getStatusColor = (status) => {
    const colorMap = {
      scheduled: "blue",
      confirmed: "green",
      "checked-in": "purple",
      "in-progress": "yellow",
      completed: "green",
      cancelled: "red",
      "no-show": "red",
      rescheduled: "orange",
    };
    return colorMap[status] || "gray";
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

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "Brak danych";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return `${age} lat`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Brak danych";
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Brak danych";
    return new Date(dateString).toLocaleString("pl-PL");
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getPatient(id), getPatientAppointments(id)])
      .then(([patRes, appRes]) => {
        if (mounted) {
          setPatient(patRes.data.data || patRes.data);
          setAppointments(appRes.data?.data || []);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Error loading patient data:", err);
        setError("Błąd ładowania danych pacjenta");
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleCloseModal = () => setIsModalOpen(false);

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

  const { personalInfo, address, medicalInfo, isActive, createdAt } = patient;

  return (
    <div className="space-y-8 p-6">
      {/* Nagłówek z akcjami */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <p className="text-gray-600 mt-1">
            {calculateAge(personalInfo.dateOfBirth)} •{" "}
            {getGenderLabel(personalInfo.gender)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={isActive !== false ? "green" : "red"}>
            {isActive !== false ? "Aktywny" : "Nieaktywny"}
          </Badge>
          <Link href={`/dashboard/patients/${id}/edit`}>
            <Button variant="outline">Edytuj</Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>Nowa wizyta</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lewa kolumna - Dane osobowe i kontakt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dane osobowe */}
          <Card>
            <Card.Header>
              <Card.Title>Dane osobowe</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Imię i nazwisko
                    </label>
                    <p className="text-lg">
                      {personalInfo.firstName} {personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Data urodzenia
                    </label>
                    <p>{formatDate(personalInfo.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Wiek
                    </label>
                    <p>{calculateAge(personalInfo.dateOfBirth)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Płeć
                    </label>
                    <p>{getGenderLabel(personalInfo.gender)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Dodano do systemu
                    </label>
                    <p>{formatDate(createdAt)}</p>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Dane kontaktowe */}
          <Card>
            <Card.Header>
              <Card.Title>Dane kontaktowe</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Telefon
                    </label>
                    <p>
                      {personalInfo.contact?.phone ? (
                        <a
                          href={`tel:${personalInfo.contact.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {personalInfo.contact.phone}
                        </a>
                      ) : (
                        "Brak danych"
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p>
                      {personalInfo.contact?.email ? (
                        <a
                          href={`mailto:${personalInfo.contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {personalInfo.contact.email}
                        </a>
                      ) : (
                        "Brak danych"
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Adres
                    </label>
                    {address && (address.street || address.city) ? (
                      <div className="space-y-1">
                        {address.street && <p>{address.street}</p>}
                        <p>
                          {address.zipCode && `${address.zipCode} `}
                          {address.city}
                          {address.state && `, ${address.state}`}
                        </p>
                        {address.country && address.country !== "Polska" && (
                          <p>{address.country}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Brak adresu</p>
                    )}
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Wizyty pacjenta */}
          <Card>
            <Card.Header>
              <div className="flex justify-between items-center">
                <Card.Title>Historia wizyt ({appointments.length})</Card.Title>
                <Button onClick={() => setIsModalOpen(true)}>
                  Nowa wizyta
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    Brak zaplanowanych wizyt
                  </div>
                  <Link href={`/dashboard/patients/${id}/appointments/new`}>
                    <Button>Zaplanuj pierwszą wizytę</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments
                    .sort(
                      (a, b) =>
                        new Date(b.scheduledDateTime) -
                        new Date(a.scheduledDateTime)
                    )
                    .map((apt) => (
                      <div
                        key={apt._id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">
                              {formatDateTime(apt.scheduledDateTime)}
                            </span>
                            <Badge color={getStatusColor(apt.status)} size="sm">
                              {getStatusLabel(apt.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {apt.service?.name && (
                              <span className="font-medium">
                                {apt.service.name}
                              </span>
                            )}
                            {apt.physiotherapist?.personalInfo && (
                              <span className="ml-2">
                                • {apt.physiotherapist.personalInfo.firstName}{" "}
                                {apt.physiotherapist.personalInfo.lastName}
                              </span>
                            )}
                          </div>
                          {apt.notes && (
                            <div className="text-sm text-gray-500 mt-1">
                              {apt.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3 md:mt-0">
                          <Link href={`/dashboard/appointments/${apt._id}`}>
                            <Button variant="outline" size="sm">
                              Szczegóły
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Prawa kolumna - Informacje medyczne */}
        <div className="space-y-6">
          {/* Alergie */}
          <Card>
            <Card.Header>
              <Card.Title className="text-red-600">⚠️ Alergie</Card.Title>
            </Card.Header>
            <Card.Content>
              {medicalInfo?.allergies?.length > 0 ? (
                <div className="space-y-2">
                  {medicalInfo.allergies.map((allergy, index) => (
                    <Badge key={index} color="red" className="mr-2 mb-2">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Brak znanych alergii</p>
              )}
            </Card.Content>
          </Card>

          {/* Leki */}
          <Card>
            <Card.Header>
              <Card.Title className="text-blue-600">
                💊 Przyjmowane leki
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {medicalInfo?.medications?.length > 0 ? (
                <div className="space-y-3">
                  {medicalInfo.medications.map((medication, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-200 pl-3"
                    >
                      <div className="font-medium">{medication.name}</div>
                      {medication.dosage && (
                        <div className="text-sm text-gray-600">
                          Dawka: {medication.dosage}
                        </div>
                      )}
                      {medication.frequency && (
                        <div className="text-sm text-gray-600">
                          Częstotliwość: {medication.frequency}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nie przyjmuje leków</p>
              )}
            </Card.Content>
          </Card>

          {/* Choroby przewlekłe */}
          <Card>
            <Card.Header>
              <Card.Title className="text-orange-600">
                🏥 Choroby przewlekłe
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {medicalInfo?.chronicConditions?.length > 0 ? (
                <div className="space-y-2">
                  {medicalInfo.chronicConditions.map((condition, index) => (
                    <Badge key={index} color="orange" className="mr-2 mb-2">
                      {condition}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Brak chorób przewlekłych</p>
              )}
            </Card.Content>
          </Card>

          {/* Historia medyczna */}
          <Card>
            <Card.Header>
              <Card.Title>📋 Historia medyczna</Card.Title>
            </Card.Header>
            <Card.Content>
              {medicalInfo?.medicalHistory?.length > 0 ? (
                <ul className="space-y-2">
                  {medicalInfo.medicalHistory.map((history, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-sm">{history}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Brak historii medycznej</p>
              )}
            </Card.Content>
          </Card>

          {/* Uwagi specjalne */}
          {medicalInfo?.specialNotes && (
            <Card>
              <Card.Header>
                <Card.Title>📝 Uwagi specjalne</Card.Title>
              </Card.Header>
              <Card.Content>
                <p className="text-sm whitespace-pre-wrap bg-yellow-50 p-3 rounded border-l-4 border-yellow-200">
                  {medicalInfo.specialNotes}
                </p>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>

      {/* Powrót */}
      <div className="flex justify-start pt-6 border-t">
        <Button variant="secondary" onClick={() => router.back()}>
          ← Wróć do listy pacjentów
        </Button>
      </div>

      <AddAppointment
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        selectedDate={selectedDate}
      />
    </div>
  );
}
