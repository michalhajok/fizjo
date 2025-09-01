import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks";
import DataTable from "@/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import useApiFetch from "@/hooks/useApiFetch";
import { createUser, getUsers } from "@/lib/api";

export default function AdminDashboard() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "physiotherapist",
    password: "",
  });
  const [userFormError, setUserFormError] = useState(null);
  const [submittingUser, setSubmittingUser] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const {
    data: usersData,
    loading: loadingUsers,
    error,
    refetch,
  } = useApiFetch(getUsers, [], true);

  const defaultRolePermissions = {
    admin: ["admin:all"],
    // manager: [
    //   "patients:read",
    //   "patients:write",
    //   "patients:delete",
    //   "employees:read",
    //   "employees:write",
    //   "visits:read",
    //   "visits:write",
    //   "visits:delete",
    //   "reports:read",
    //   "reports:write",
    //   "settings:read",
    //   "settings:write",
    // ],
    physiotherapist: [
      "patients:read",
      "patients:write",
      "visits:read",
      "visits:write",
      "reports:read",
    ],
    receptionist: [
      "patients:read",
      "patients:write",
      "visits:read",
      "visits:write",
    ],
    // assistant: ["patients:read", "visits:read"],
  };

  const roleOptions = [
    { value: "admin", label: "Administrator" },
    // { value: "manager", label: "Manager" },
    { value: "physiotherapist", label: "Fizjoterapeuta" },
    { value: "receptionist", label: "Recepcjonista" },
    // { value: "assistant", label: "Asystent" },
  ];

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserFormError(null);
    setSubmittingUser(true);
    const userData = {
      ...userForm,
      permissions: defaultRolePermissions[userForm.role] || [],
    };
    const { data, error } = await createUser(userData);
    setSubmittingUser(false);
    if (error) {
      setUserFormError(error);
    } else {
      setIsUserModalOpen(false);
      setUserForm({
        firstName: "",
        lastName: "",
        email: "",
        role: "physiotherapist",
        password: "",
      });
    }
  };
  const handleUserRoleChange = (option) => {
    setUserForm((prev) => ({ ...prev, role: option.value }));
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
    setUserFormError(null);
  };

  if (loadingUsers || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie..." />
      </div>
    );
  }

  const columns = [
    { key: "firstName", label: "Imię" },
    { key: "lastName", label: "Nazwisko" },
    { key: "email", label: "Email" },
    { key: "role", label: "Rola" },
    { key: "active", label: "Aktywny" },
    { key: "createdAt", label: "Data utworzenia" },
    {
      key: "actions",
      label: "Akcje",
      render: (_, user) => (
        <Link
          href={`/dashboard/admin/users/${user?.id}`}
          className="text-blue-600 hover:underline"
        >
          Szczegóły
        </Link>
      ),
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Zarządzanie użytkownikami
        </h2>
        <Button onClick={() => setIsUserModalOpen(true)}>
          Dodaj użytkownika
        </Button>
      </div>
      <DataTable
        data={usersData?.map((u) => ({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: roleOptions.find((o) => o.value === u.role)?.label || u.role,
          active: u.isActive ? "Tak" : "Nie",
          createdAt: new Date(u.createdAt).toLocaleDateString(),
          id: u.id,
        }))}
        columns={columns}
        loading={loadingUsers}
        pageSize={10}
      />
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Dodaj nowego użytkownika"
        size="md"
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <Input
            label="Imię"
            name="firstName"
            value={userForm.firstName}
            onChange={handleUserFormChange}
            required
          />
          <Input
            label="Nazwisko"
            name="lastName"
            value={userForm.lastName}
            onChange={handleUserFormChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={userForm.email}
            onChange={handleUserFormChange}
            required
          />
          <Select
            label="Rola"
            options={roleOptions}
            value={roleOptions.find((o) => o.value === userForm.role)}
            onChange={handleUserRoleChange}
            required
          />
          <Input
            label="Hasło"
            name="password"
            type="password"
            value={userForm.password}
            onChange={handleUserFormChange}
            required
          />
          {userFormError && (
            <div className="text-red-600 text-sm">{userFormError}</div>
          )}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUserModalOpen(false)}
              disabled={submittingUser}
            >
              Anuluj
            </Button>
            <Button type="submit" loading={submittingUser}>
              Dodaj użytkownika
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
