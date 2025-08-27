"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { createPatient } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

const genderOptions = [
  { value: "M", label: "Mężczyzna" },
  { value: "F", label: "Kobieta" },
  { value: "Other", label: "Inna" },
];

export default function AddPatientPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      pesel: "",
      dateOfBirth: "",
      gender: "",
      contact: {
        phone: "",
        email: "",
      },
    },
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Polska",
    },
    medicalInfo: {
      allergies: [],
      medications: [],
      chronicConditions: [],
      medicalHistory: [],
      specialNotes: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Nowe state dla dynamicznych list
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newHistory, setNewHistory] = useState("");
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const handleInputChange = (section, field, value, subField = null) => {
    setForm((prev) => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subField]: value,
            },
          },
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };
      }
    });

    // Wyczyść błąd dla tego pola
    if (errors[`${section}.${field}${subField ? `.${subField}` : ""}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${section}.${field}${subField ? `.${subField}` : ""}`]: null,
      }));
    }
  };

  // Funkcje dla zarządzania listami
  const addToList = (section, field, value, resetState) => {
    if (!value.trim()) return;

    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], value.trim()],
      },
    }));
    resetState();
  };

  const removeFromList = (section, field, index) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index),
      },
    }));
  };

  const addMedication = () => {
    if (!newMedication.name.trim()) return;

    setForm((prev) => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        medications: [...prev.medicalInfo.medications, { ...newMedication }],
      },
    }));

    setNewMedication({ name: "", dosage: "", frequency: "" });
  };

  const removeMedication = (index) => {
    setForm((prev) => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        medications: prev.medicalInfo.medications.filter((_, i) => i !== index),
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Walidacja podstawowych informacji
    if (!form.personalInfo.firstName.trim()) {
      newErrors["personalInfo.firstName"] = "Imię jest wymagane";
    }
    if (!form.personalInfo.lastName.trim()) {
      newErrors["personalInfo.lastName"] = "Nazwisko jest wymagane";
    }
    if (!form.personalInfo.pesel.trim()) {
      newErrors["personalInfo.pesel"] = "PESEL jest wymagany";
    } else if (!/^\d{11}$/.test(form.personalInfo.pesel)) {
      newErrors["personalInfo.pesel"] = "PESEL musi składać się z 11 cyfr";
    }
    if (!form.personalInfo.dateOfBirth) {
      newErrors["personalInfo.dateOfBirth"] = "Data urodzenia jest wymagana";
    }
    if (!form.personalInfo.gender) {
      newErrors["personalInfo.gender"] = "Płeć jest wymagana";
    }
    if (!form.personalInfo.contact.phone.trim()) {
      newErrors["personalInfo.contact.phone"] = "Numer telefonu jest wymagany";
    }
    if (!form.personalInfo.contact.email.trim()) {
      newErrors["personalInfo.contact.email"] = "Email jest wymagany";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const { data, error } = await createPatient(form);

      if (error) {
        setApiError(error);
      } else {
        router.push("/patients");
      }
    } catch (err) {
      setApiError("Wystąpił błąd podczas zapisywania pacjenta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Dodaj nowego pacjenta
          </h1>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informacje osobowe */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informacje osobowe
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Imię *"
                  type="text"
                  value={form.personalInfo.firstName}
                  onChange={(e) =>
                    handleInputChange(
                      "personalInfo",
                      "firstName",
                      e.target.value
                    )
                  }
                  error={errors["personalInfo.firstName"]}
                  maxLength={50}
                />
                <Input
                  label="Nazwisko *"
                  type="text"
                  value={form.personalInfo.lastName}
                  onChange={(e) =>
                    handleInputChange(
                      "personalInfo",
                      "lastName",
                      e.target.value
                    )
                  }
                  error={errors["personalInfo.lastName"]}
                  maxLength={50}
                />
                <Input
                  label="PESEL *"
                  type="text"
                  value={form.personalInfo.pesel}
                  onChange={(e) =>
                    handleInputChange("personalInfo", "pesel", e.target.value)
                  }
                  error={errors["personalInfo.pesel"]}
                  maxLength={11}
                  placeholder="12345678901"
                />
                <Input
                  label="Data urodzenia *"
                  type="date"
                  value={form.personalInfo.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange(
                      "personalInfo",
                      "dateOfBirth",
                      e.target.value
                    )
                  }
                  error={errors["personalInfo.dateOfBirth"]}
                />
                <Select
                  label="Płeć *"
                  value={form.personalInfo.gender}
                  onChange={(e) =>
                    handleInputChange("personalInfo", "gender", e)
                  }
                  options={genderOptions}
                  error={errors["personalInfo.gender"]}
                />
              </div>
            </div>

            {/* Kontakt */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Dane kontaktowe
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Numer telefonu *"
                  type="tel"
                  value={form.personalInfo.contact.phone}
                  onChange={(e) =>
                    handleInputChange(
                      "personalInfo",
                      "contact",
                      e.target.value,
                      "phone"
                    )
                  }
                  error={errors["personalInfo.contact.phone"]}
                  placeholder="123456789"
                />
                <Input
                  label="Email *"
                  type="email"
                  value={form.personalInfo.contact.email}
                  onChange={(e) =>
                    handleInputChange(
                      "personalInfo",
                      "contact",
                      e.target.value,
                      "email"
                    )
                  }
                  error={errors["personalInfo.contact.email"]}
                  placeholder="jan@example.com"
                />
              </div>
            </div>

            {/* Adres */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Adres</h2>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Ulica"
                  type="text"
                  value={form.address.street}
                  onChange={(e) =>
                    handleInputChange("address", "street", e.target.value)
                  }
                  placeholder="ul. Przykładowa 123"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Miasto"
                    type="text"
                    value={form.address.city}
                    onChange={(e) =>
                      handleInputChange("address", "city", e.target.value)
                    }
                    placeholder="Warszawa"
                  />
                  <Input
                    label="Województwo"
                    type="text"
                    value={form.address.state}
                    onChange={(e) =>
                      handleInputChange("address", "state", e.target.value)
                    }
                    placeholder="mazowieckie"
                  />
                  <Input
                    label="Kod pocztowy"
                    type="text"
                    value={form.address.zipCode}
                    onChange={(e) =>
                      handleInputChange("address", "zipCode", e.target.value)
                    }
                    placeholder="00-000"
                  />
                </div>
                <Input
                  label="Kraj"
                  type="text"
                  value={form.address.country}
                  onChange={(e) =>
                    handleInputChange("address", "country", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Informacje medyczne */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informacje medyczne
              </h2>

              {/* Alergie */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alergie
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Dodaj alergię..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      addToList("medicalInfo", "allergies", newAllergy, () =>
                        setNewAllergy("")
                      )
                    }
                  >
                    Dodaj
                  </Button>
                </div>
                {form.medicalInfo.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.medicalInfo.allergies.map((allergy, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{allergy}</span>
                        <button
                          type="button"
                          onClick={() =>
                            removeFromList("medicalInfo", "allergies", index)
                          }
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leki */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Przyjmowane leki
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <Input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) =>
                      setNewMedication({
                        ...newMedication,
                        name: e.target.value,
                      })
                    }
                    placeholder="Nazwa leku"
                  />
                  <Input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) =>
                      setNewMedication({
                        ...newMedication,
                        dosage: e.target.value,
                      })
                    }
                    placeholder="Dawka"
                  />
                  <Input
                    type="text"
                    value={newMedication.frequency}
                    onChange={(e) =>
                      setNewMedication({
                        ...newMedication,
                        frequency: e.target.value,
                      })
                    }
                    placeholder="Częstotliwość"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMedication}
                  >
                    Dodaj
                  </Button>
                </div>
                {form.medicalInfo.medications.length > 0 && (
                  <div className="space-y-2">
                    {form.medicalInfo.medications.map((medication, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-blue-50 p-3 rounded-md"
                      >
                        <div>
                          <strong>{medication.name}</strong>
                          {medication.dosage && (
                            <span className="text-gray-600">
                              {" "}
                              - {medication.dosage}
                            </span>
                          )}
                          {medication.frequency && (
                            <span className="text-gray-600">
                              {" "}
                              - {medication.frequency}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Usuń
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Choroby przewlekłe */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choroby przewlekłe
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Dodaj chorobę przewlekłą..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      addToList(
                        "medicalInfo",
                        "chronicConditions",
                        newCondition,
                        () => setNewCondition("")
                      )
                    }
                  >
                    Dodaj
                  </Button>
                </div>
                {form.medicalInfo.chronicConditions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.medicalInfo.chronicConditions.map(
                      (condition, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{condition}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeFromList(
                                "medicalInfo",
                                "chronicConditions",
                                index
                              )
                            }
                            className="ml-2 text-orange-600 hover:text-orange-800"
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Historia medyczna */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Historia medyczna
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    placeholder="Dodaj informację medyczną..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      addToList(
                        "medicalInfo",
                        "medicalHistory",
                        newHistory,
                        () => setNewHistory("")
                      )
                    }
                  >
                    Dodaj
                  </Button>
                </div>
                {form.medicalInfo.medicalHistory.length > 0 && (
                  <div className="space-y-2">
                    {form.medicalInfo.medicalHistory.map((history, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-green-50 p-2 rounded-md"
                      >
                        <span>{history}</span>
                        <button
                          type="button"
                          onClick={() =>
                            removeFromList(
                              "medicalInfo",
                              "medicalHistory",
                              index
                            )
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uwagi specjalne */}
              <div className="mb-6">
                <Textarea
                  label="Uwagi specjalne"
                  value={form.medicalInfo.specialNotes}
                  onChange={(e) =>
                    handleInputChange(
                      "medicalInfo",
                      "specialNotes",
                      e.target.value
                    )
                  }
                  placeholder="Dodatkowe informacje medyczne, uwagi specjalne..."
                  rows={4}
                />
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[120px]"
              >
                {submitting ? <Spinner size="sm" /> : "Zapisz pacjenta"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
