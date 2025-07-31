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
    medicalInfo: {
      allergies: [],
      medications: [],
      chronicConditions: [],
      medicalHistory: [],
    },
    physiotherapyData: {
      referringPhysician: "",
      initialDiagnosis: "",
      treatmentGoals: [],
      contraindications: [],
      specialNotes: "",
    },
    consentGiven: false,
    consentDate: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie..." />
      </div>
    );
  }

  // Walidacja formularza (przykład, rozbuduj wg potrzeb)
  const validate = () => {
    const newErrors = {};
    if (!form.personalInfo.firstName.trim())
      newErrors.firstName = "Imię jest wymagane";
    if (!form.personalInfo.lastName.trim())
      newErrors.lastName = "Nazwisko jest wymagane";
    if (!form.personalInfo.pesel) newErrors.pesel = "PESEL jest wymagany";
    else if (!/^\d{11}$/.test(form.personalInfo.pesel))
      newErrors.pesel = "PESEL musi mieć 11 cyfr";
    if (!form.personalInfo.dateOfBirth)
      newErrors.dateOfBirth = "Data urodzenia jest wymagana";
    if (!form.personalInfo.gender) newErrors.gender = "Płeć jest wymagana";
    if (!form.personalInfo.contact.phone)
      newErrors.phone = "Telefon jest wymagany";
    if (!form.personalInfo.contact.email)
      newErrors.email = "Email jest wymagany";
    else if (!/\S+@\S+\.\S+/.test(form.personalInfo.contact.email))
      newErrors.email = "Nieprawidłowy email";
    if (!form.consentGiven) newErrors.consentGiven = "Wymagana zgoda RODO";
    if (!form.consentDate) newErrors.consentDate = "Data zgody jest wymagana";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Obsługa pól zagnieżdżonych
    if (name.startsWith("personalInfo.contact.")) {
      const field = name.split(".")[2];
      setForm((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          contact: {
            ...prev.personalInfo.contact,
            [field]: value,
          },
        },
      }));
    } else if (name.startsWith("personalInfo.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectGender = (option) => {
    setForm((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        gender: option.value,
      },
    }));
    setErrors((prev) => ({ ...prev, gender: undefined }));
  };

  const handleConsent = (e) => {
    setForm((prev) => ({
      ...prev,
      consentGiven: e.target.checked,
      consentDate: e.target.checked ? new Date().toISOString() : "",
    }));
    setErrors((prev) => ({
      ...prev,
      consentGiven: undefined,
      consentDate: undefined,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    const { data, error } = await createPatient(form);
    setSubmitting(false);
    if (error) {
      setApiError(error);
    } else {
      router.push("/dashboard/patients");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-700">Dodaj pacjenta</h1>
      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Imię"
                name="personalInfo.firstName"
                value={form.personalInfo.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              <Input
                label="Nazwisko"
                name="personalInfo.lastName"
                value={form.personalInfo.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="PESEL"
                name="personalInfo.pesel"
                value={form.personalInfo.pesel}
                onChange={handleChange}
                error={errors.pesel}
                required
              />
              <Input
                label="Data urodzenia"
                name="personalInfo.dateOfBirth"
                type="date"
                value={form.personalInfo.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
                required
              />
            </div>
            <Select
              label="Płeć"
              options={genderOptions}
              value={genderOptions.find(
                (o) => o.value === form.personalInfo.gender
              )}
              onChange={handleSelectGender}
              error={errors.gender}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Telefon"
                name="personalInfo.contact.phone"
                value={form.personalInfo.contact.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />
              <Input
                label="Email"
                name="personalInfo.contact.email"
                type="email"
                value={form.personalInfo.contact.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>
            {/* Zgoda RODO */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="consentGiven"
                checked={form.consentGiven}
                onChange={handleConsent}
                className="h-4 w-4"
              />
              <label htmlFor="consentGiven" className="text-sm">
                Wyrażam zgodę na przetwarzanie danych osobowych (RODO)
              </label>
            </div>
            {errors.consentGiven && (
              <div className="text-red-600 text-sm">{errors.consentGiven}</div>
            )}
            {apiError && <div className="text-red-600 text-sm">{apiError}</div>}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Anuluj
              </Button>
              <Button type="submit" loading={submitting}>
                Dodaj pacjenta
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
