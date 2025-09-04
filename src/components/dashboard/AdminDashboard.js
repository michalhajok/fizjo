import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { createUser, getUsers } from "@/lib/api";

import DataTable from "@/ui/DataTable";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import useApiFetch from "@/hooks/useApiFetch";
import ResetPassword from "../modal/ResetPassword";
import AddUser from "../modal/AddUser";

export default function AdminDashboard() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // const [userFormError, setUserFormError] = useState(null);
  // const [submittingUser, setSubmittingUser] = useState(false);
  const [resetModal, setResetModal] = useState({ open: false, user: null });
  const [generatingLink, setGeneratingLink] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const {
    data: usersData,
    loading: loadingUsers,
    error,
    refetch,
  } = useApiFetch(getUsers, [], true);

  const roleOptions = [
    { value: "admin", label: "Administrator" },
    // { value: "manager", label: "Manager" },
    { value: "physiotherapist", label: "Fizjoterapeuta" },
    { value: "receptionist", label: "Recepcjonista" },
    // { value: "assistant", label: "Asystent" },
  ];

  // const handleUserSubmit = async (e) => {
  //   e.preventDefault();
  //   setUserFormError(null);
  //   setSubmittingUser(true);
  //   const userData = {
  //     ...userForm,
  //     permissions: defaultRolePermissions[userForm.role] || [],
  //   };
  //   const { data, error } = await createUser(userData);
  //   setSubmittingUser(false);
  //   if (error) {
  //     setUserFormError(error);
  //   } else {
  //     setIsUserModalOpen(false);
  //     setUserForm({
  //       firstName: "",
  //       lastName: "",
  //       email: "",
  //       role: "physiotherapist",
  //       password: "",
  //     });
  //   }
  // };
  // const handleUserRoleChange = (option) => {
  //   setUserForm((prev) => ({ ...prev, role: option.value }));
  // };

  // const handleUserFormChange = (e) => {
  //   const { name, value } = e.target;
  //   setUserForm((prev) => ({ ...prev, [name]: value }));
  //   setUserFormError(null);
  // };

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
        <div>
          <Link
            href={`/dashboard/admin/users/${user?.id}`}
            className="text-blue-600 hover:underline pr-2"
          >
            Szczegóły
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="text-orange-600 hover:bg-orange-50"
            onClick={() => setResetModal({ open: true, user })}
            disabled={generatingLink}
          >
            Reset hasła
          </Button>
        </div>
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

      <ResetPassword
        resetModal={resetModal}
        setResetModal={setResetModal}
        generatingLink={generatingLink}
        setGeneratingLink={setGeneratingLink}
      />
      <AddUser
        isUserModalOpen={isUserModalOpen}
        setIsUserModalOpen={setIsUserModalOpen}
        refetchUsers={refetch}
      />
    </section>
  );
}
