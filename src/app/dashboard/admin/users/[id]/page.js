"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getUser,
  updateUser,
  getPermissions,
  getEmployee,
  updateEmployee,
} from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";

const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "physiotherapist", label: "Fizjoterapeuta" },
  { value: "receptionist", label: "Recepcjonista" },
  { value: "assistant", label: "Asystent" },
];

const contractTypes = [
  { value: "full-time", label: "Pełny etat" },
  { value: "part-time", label: "Część etatu" },
  { value: "contract", label: "Kontrakt" },
];

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState("user");

  console.log(employee);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getUser(id), getPermissions(), getEmployee(id)])
      .then(([userRes, permRes, empRes]) => {
        if (mounted) {
          const userData = userRes.data?.data || userRes.data;
          setUser(userData);
          setForm({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone || "",
            role: userData.role,
            isActive: userData.isActive,
            permissions: userData.permissions || [],
          });
          setAvailablePermissions(permRes.data?.permissions || []);
          // UWAGA: tu obsługa różnych struktur backendu
          const emp = empRes.data?.employee || empRes.data?.data || empRes.data;
          setEmployee(emp);
        }
      })
      .catch(() => setError("Błąd ładowania danych użytkownika"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" text="Ładowanie użytkownika..." />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="p-6 text-center text-red-600">
        {error || "Nie znaleziono użytkownika"}
        <Button onClick={() => router.back()} className="ml-4">
          Wróć
        </Button>
      </div>
    );
  }

  // Obsługa formularza użytkownika
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSuccess(false);
    setError(null);
  };

  const handleRoleChange = (option) => {
    setForm((prev) => ({
      ...prev,
      role: option.value,
    }));
    setSuccess(false);
    setError(null);
  };

  const handlePermissionToggle = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
    setSuccess(false);
    setError(null);
  };

  // Obsługa formularza pracownika
  const handleEmployeeChange = (section, name, value) => {
    setEmployee((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
    setSuccess(false);
    setError(null);
  };

  // Obsługa głębszych pól (np. contact, address, emergencyContact)
  const handleEmployeeNestedChange = (section, subSection, name, value) => {
    setEmployee((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [name]: value,
        },
      },
    }));
    setSuccess(false);
    setError(null);
  };

  // Zapisz dane użytkownika lub pracownika (w zależności od zakładki)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    if (tab === "user") {
      const { firstName, lastName, email, phone, role, isActive, permissions } =
        form;
      const { error } = await updateUser(id, {
        firstName,
        lastName,
        email,
        phone,
        role,
        isActive,
        permissions,
      });
      setSaving(false);
      if (error) setError(error);
      else setSuccess(true);
    } else if (tab === "employee") {
      const { error, data } = await updateEmployee(employee._id, employee);
      setSaving(false);
      if (error) setError(error);
      else {
        setSuccess(true);
        if (data) setEmployee(data); // odśwież dane po zapisie
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-700">
          {user.firstName} {user.lastName}
        </h1>
        <Badge color={form.isActive ? "green" : "gray"}>
          {form.isActive ? "Aktywny" : "Nieaktywny"}
        </Badge>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "user", label: "Dane użytkownika" },
          { value: "employee", label: "Dane pracownika" },
        ]}
      />
      {tab === "user" && (
        <Card>
          <Card.Header>
            <Card.Title>Dane użytkownika</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Imię"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Nazwisko"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Telefon"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
                <Select
                  label="Rola"
                  options={roleOptions}
                  value={roleOptions.find((o) => o.value === form.role)}
                  onChange={handleRoleChange}
                  required
                />
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span>Aktywny użytkownik</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="font-semibold mb-2">Uprawnienia:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => (
                    <label key={perm.name} className="flex items-center gap-2">
                      <Checkbox
                        checked={form.permissions.includes(perm.name)}
                        onChange={() => handlePermissionToggle(perm.name)}
                      />
                      <span>{perm.displayName || perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {error && (
                <div className="text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-600 bg-green-50 p-2 rounded">
                  Zmiany zostały zapisane!
                </div>
              )}
              <div className="flex justify-end gap-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Anuluj
                </Button>
                <Button type="submit" loading={saving}>
                  Zapisz zmiany
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}
      {tab === "employee" && employee && employee.personalInfo && (
        <Card>
          <Card.Header>
            <Card.Title>Dane pracownika</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dane osobowe */}
              <div>
                <h3 className="font-semibold mb-2">Informacje osobowe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Imię"
                    value={employee.personalInfo.firstName ?? ""}
                    onChange={(e) =>
                      handleEmployeeChange(
                        "personalInfo",
                        "firstName",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    label="Nazwisko"
                    value={employee.personalInfo?.lastName || ""}
                    onChange={(e) =>
                      handleEmployeeChange(
                        "personalInfo",
                        "lastName",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    label="Data urodzenia"
                    type="date"
                    value={
                      employee.personalInfo?.dateOfBirth?.slice(0, 10) || ""
                    }
                    onChange={(e) =>
                      handleEmployeeChange(
                        "personalInfo",
                        "dateOfBirth",
                        e.target.value
                      )
                    }
                  />
                  <Select
                    label="Płeć"
                    options={[
                      { value: "M", label: "Mężczyzna" },
                      { value: "F", label: "Kobieta" },
                      { value: "Other", label: "Inna" },
                    ]}
                    value={{
                      value: employee.personalInfo?.gender,
                      label: employee.personalInfo?.gender,
                    }}
                    onChange={(o) =>
                      handleEmployeeChange("personalInfo", "gender", o.value)
                    }
                  />
                  <Input
                    label="Telefon"
                    value={employee.personalInfo?.contact?.phone || ""}
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "contact",
                        "phone",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    label="Email"
                    value={employee.personalInfo?.contact?.email || ""}
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "contact",
                        "email",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Input
                    label="Ulica"
                    value={employee.personalInfo?.address?.street || ""}
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "address",
                        "street",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    label="Miasto"
                    value={employee.personalInfo?.address?.city || ""}
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "address",
                        "city",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    label="Kod pocztowy"
                    value={employee.personalInfo?.address?.postalCode || ""}
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "address",
                        "postalCode",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    label="Kraj"
                    value={employee.personalInfo?.address?.country || ""}
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "address",
                        "country",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="mt-2">
                  <Input
                    label="Osoba do kontaktu w nagłych wypadkach"
                    value={
                      employee.personalInfo?.contact?.emergencyContact?.name ||
                      ""
                    }
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "contact",
                        "emergencyContact",
                        {
                          ...employee.personalInfo?.contact?.emergencyContact,
                          name: e.target.value,
                        }
                      )
                    }
                  />
                  <Input
                    label="Telefon ICE"
                    value={
                      employee.personalInfo?.contact?.emergencyContact?.phone ||
                      ""
                    }
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "contact",
                        "emergencyContact",
                        {
                          ...employee.personalInfo?.contact?.emergencyContact,
                          phone: e.target.value,
                        }
                      )
                    }
                  />
                  <Input
                    label="Relacja ICE"
                    value={
                      employee.personalInfo?.contact?.emergencyContact
                        ?.relationship || ""
                    }
                    onChange={(e) =>
                      handleEmployeeNestedChange(
                        "personalInfo",
                        "contact",
                        "emergencyContact",
                        {
                          ...employee.personalInfo?.contact?.emergencyContact,
                          relationship: e.target.value,
                        }
                      )
                    }
                  />
                </div>
              </div>
              {/* Dane zawodowe */}
              <div>
                <h3 className="font-semibold mb-2">Informacje zawodowe</h3>
                <Input
                  label="Stanowisko"
                  value={employee.professionalInfo?.position || ""}
                  onChange={(e) =>
                    handleEmployeeChange(
                      "professionalInfo",
                      "position",
                      e.target.value
                    )
                  }
                />
                <Input
                  label="Specjalizacje (przecinek)"
                  value={
                    employee.professionalInfo?.specializations?.join(", ") || ""
                  }
                  onChange={(e) =>
                    handleEmployeeChange(
                      "professionalInfo",
                      "specializations",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                />
                <Input
                  label="Biografia"
                  as="textarea"
                  value={employee.professionalInfo?.biography || ""}
                  onChange={(e) =>
                    handleEmployeeChange(
                      "professionalInfo",
                      "biography",
                      e.target.value
                    )
                  }
                  rows={3}
                />
                <Input
                  label="Lata doświadczenia"
                  type="number"
                  value={employee.professionalInfo?.yearsOfExperience || ""}
                  onChange={(e) =>
                    handleEmployeeChange(
                      "professionalInfo",
                      "yearsOfExperience",
                      e.target.value
                    )
                  }
                />
                {/* Możesz dodać edycję licencji, edukacji, certyfikatów */}
              </div>
              {/* Informacje o zatrudnieniu */}
              <div>
                <h3 className="font-semibold mb-2">
                  Informacje o zatrudnieniu
                </h3>
                <Input
                  label="Data zatrudnienia"
                  type="date"
                  value={
                    employee.employmentInfo?.employmentDate?.slice(0, 10) || ""
                  }
                  onChange={(e) =>
                    handleEmployeeChange(
                      "employmentInfo",
                      "employmentDate",
                      e.target.value
                    )
                  }
                />
                <Select
                  label="Typ umowy"
                  options={contractTypes}
                  value={contractTypes.find(
                    (o) => o.value === employee.employmentInfo?.contractType
                  )}
                  onChange={(o) =>
                    handleEmployeeChange(
                      "employmentInfo",
                      "contractType",
                      o.value
                    )
                  }
                />
                <Input
                  label="Dział"
                  value={employee.employmentInfo?.department || ""}
                  onChange={(e) =>
                    handleEmployeeChange(
                      "employmentInfo",
                      "department",
                      e.target.value
                    )
                  }
                />
              </div>
              {error && (
                <div className="text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-600 bg-green-50 p-2 rounded">
                  Zmiany zostały zapisane!
                </div>
              )}
              <div className="flex justify-end gap-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Anuluj
                </Button>
                <Button type="submit" loading={saving}>
                  Zapisz zmiany
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}
