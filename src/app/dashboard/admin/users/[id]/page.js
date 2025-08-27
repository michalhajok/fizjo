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
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import ScheduleManager from "@/components/admin/ScheduleManager";
import EmployeeTab from "@/components/admin/EmployeeTab";
import UserTab from "@/components/admin/UserTab";

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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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
        <UserTab
          error={error}
          saving={saving}
          success={success}
          handleSubmit={handleSubmit}
          form={form}
          handleChange={handleChange}
          handleRoleChange={handleRoleChange}
          availablePermissions={availablePermissions}
          handlePermissionToggle={handlePermissionToggle}
          roleOptions={roleOptions}
        />
      )}
      {tab === "employee" && employee && employee.personalInfo && (
        <EmployeeTab
          employee={employee}
          error={error}
          saving={saving}
          success={success}
          setShowScheduleModal={setShowScheduleModal}
          contractTypes={contractTypes}
          handleSubmit={handleSubmit}
          handleEmployeeChange={handleEmployeeChange}
          handleEmployeeNestedChange={handleEmployeeNestedChange}
        />
      )}

      <ScheduleManager
        showScheduleModal={showScheduleModal}
        employeeId={employee._id}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
}
