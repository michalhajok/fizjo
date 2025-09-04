import { useState } from "react";
import { createUser } from "@/lib/api";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function AddUser({
  isUserModalOpen,
  setIsUserModalOpen,
  refetchUsers,
}) {
  const [userFormError, setUserFormError] = useState(null);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "physiotherapist",
    password: "",
  });
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
      refetchUsers();
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

  return (
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
  );
}
