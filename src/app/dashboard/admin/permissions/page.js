"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { getUsers, updateUserRole, updateUserPermissions } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import Input from "@/components/ui/Input";

const roles = {
  admin: "Administrator",
  // manager: "Menedżer",
  physiotherapist: "Fizjoterapeuta",
  receptionist: "Recepcjonista",
  // assistant: "Asystent",
};

const permissions = {
  // Admin
  "admin:all": "Pełne uprawnienia administratora",

  // Pacjenci
  "patients:read": "Przeglądanie pacjentów",
  "patients:write": "Dodawanie i edycja pacjentów",
  "patients:delete": "Usuwanie pacjentów",

  // Pracownicy
  "employees:read": "Przeglądanie pracowników",
  "employees:write": "Dodawanie i edycja pracowników",
  "employees:delete": "Usuwanie pracowników",

  // Wizyty
  "visits:read": "Przeglądanie wizyt",
  "visits:write": "Tworzenie i edycja wizyt",
  "visits:delete": "Usuwanie wizyt",

  // Raporty
  "reports:read": "Dostęp do raportów",
  "reports:write": "Tworzenie i eksport raportów",

  // Ustawienia
  "settings:read": "Przeglądanie ustawień",
  "settings:write": "Edycja ustawień systemu",
};

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

const getRoleColor = (role) => {
  const colors = {
    admin: "red",
    manager: "purple",
    physiotherapist: "blue",
    receptionist: "green",
    assistant: "gray",
  };
  return colors[role] || "gray";
};

const getPermissionCategory = (permission) => {
  if (permission.startsWith("admin:")) return "admin";
  if (permission.startsWith("patients:")) return "patients";
  if (permission.startsWith("employees:")) return "employees";
  if (permission.startsWith("visits:")) return "visits";
  if (permission.startsWith("reports:")) return "reports";
  if (permission.startsWith("settings:")) return "settings";
  return "other";
};

const getCategoryIcon = (category) => {
  const icons = {
    admin: "👑",
    patients: "👥",
    employees: "👨‍💼",
    visits: "📅",
    reports: "📊",
    settings: "⚙️",
  };
  return icons[category] || "📄";
};

const getCategoryLabel = (category) => {
  const labels = {
    admin: "Administracja",
    patients: "Pacjenci",
    employees: "Pracownicy",
    visits: "Wizyty",
    reports: "Raporty",
    settings: "Ustawienia",
  };
  return labels[category] || "Inne";
};

export default function PermissionsPage() {
  const { user, loading: authLoading } = useAuth();

  console.log("user in permissions page:", user);

  // Data states
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [roleModal, setRoleModal] = useState({ open: false, user: null });
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [saving, setSaving] = useState(false);

  // Search state
  const [search, setSearch] = useState("");

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await getUsers();

        if (error) {
          setError(error);
          return;
        }

        setUsers(data || []);
      } catch (err) {
        console.error("Error loading users:", err);
        setError("Błąd ładowania użytkowników");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!roleModal.user || !selectedRole) return;

    setSaving(true);
    try {
      const newPermissions = defaultRolePermissions[selectedRole] || [];
      const { error } = await updateUserRole(roleModal.user._id, selectedRole);

      if (error) {
        alert("Błąd zmiany roli: " + error);
        return;
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u._id === roleModal.user._id
            ? { ...u, role: selectedRole, permissions: newPermissions }
            : u
        )
      );

      setRoleModal({ open: false, user: null });
      setSelectedRole("");
    } catch (err) {
      alert("Błąd zmiany roli");
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionsChange = async () => {
    if (!editModal.user) return;

    setSaving(true);
    try {
      const { error } = await updateUserPermissions(
        editModal.user._id,
        selectedPermissions
      );

      if (error) {
        alert("Błąd aktualizacji uprawnień: " + error);
        return;
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u._id === editModal.user._id
            ? { ...u, permissions: selectedPermissions }
            : u
        )
      );

      setEditModal({ open: false, user: null });
      setSelectedPermissions([]);
    } catch (err) {
      alert("Błąd aktualizacji uprawnień");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (user) => {
    setEditModal({ open: true, user });
    setSelectedPermissions(user.permissions || []);
  };

  const openRoleModal = (user) => {
    setRoleModal({ open: true, user });
    setSelectedRole(user.role);
  };

  const togglePermission = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const hasPermission = (userToCheck, permission) => {
    if (!userToCheck.permissions) return false;
    return (
      userToCheck.permissions.includes("admin:all") ||
      userToCheck.permissions.includes(permission)
    );
  };

  const filteredUsers = users.filter((user) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    const fullName = `${user.firstName || ""} ${
      user.lastName || ""
    }`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const role = roles[user.role]?.toLowerCase() || "";

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      role.includes(searchLower)
    );
  });

  // Group permissions by category
  const permissionsByCategory = Object.keys(permissions).reduce(
    (acc, permission) => {
      const category = getPermissionCategory(permission);
      if (!acc[category]) acc[category] = [];
      acc[category].push(permission);
      return acc;
    },
    {}
  );

  const columns = [
    {
      key: "user",
      label: "Użytkownik",
      render: (_, user) => (
        <div>
          <div className="font-medium">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rola",
      render: (_, user) => (
        <Badge color={getRoleColor(user.role)}>
          {roles[user.role] || user.role}
        </Badge>
      ),
    },
    {
      key: "permissions",
      label: "Uprawnienia",
      render: (_, user) => (
        <div>
          <div className="text-sm font-medium">
            {user.permissions?.includes("admin:all") ? (
              <Badge color="red" className="text-xs">
                Pełny dostęp
              </Badge>
            ) : (
              `${user.permissions?.length || 0} uprawnień`
            )}
          </div>
          <div className="text-xs text-gray-500">
            {user.permissions?.includes("admin:all")
              ? "Administrator systemu"
              : user.permissions
                  ?.slice(0, 2)
                  .map((p) => permissions[p]?.split(" ")[0])
                  .join(", ")}
            {user.permissions?.length > 2 &&
              !user.permissions?.includes("admin:all") &&
              ` +${user.permissions.length - 2}`}
          </div>
        </div>
      ),
    },
    {
      key: "lastLogin",
      label: "Ostatnie logowanie",
      render: (_, user) => (
        <div className="text-sm text-gray-600">
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString("pl-PL")
            : "Nigdy"}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, user) => (
        <Badge color={user.isActive ? "green" : "red"}>
          {user.isActive ? "Aktywny" : "Nieaktywny"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Akcje",
      render: (_, usr) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openRoleModal(usr)}
            disabled={usr._id === user._id} // Nie można zmieniać swojej roli
          >
            Rola
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(usr)}
          >
            Uprawnienia
          </Button>
        </div>
      ),
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie uprawnień..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
        <Button onClick={() => window.location.reload()} className="ml-4">
          Odśwież stronę
        </Button>
      </div>
    );
  }

  // Sprawdź czy user ma uprawnienia do tej strony
  if (
    !hasPermission(user, "admin:all") &&
    !hasPermission(user, "settings:write")
  ) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          Brak uprawnień do zarządzania uprawnieniami
        </div>
        <Button onClick={() => window.history.back()}>Wróć</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Nagłówek */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Zarządzanie uprawnieniami
          </h1>
          <p className="text-gray-600">
            Kontrola ról i uprawnień użytkowników systemu
          </p>
        </div>
      </div>

      {/* Przegląd ról */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(roles).map(([key, label]) => {
          const usersInRole = users.filter((u) => u.role === key).length;
          return (
            <Card key={key}>
              <Card.Content className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usersInRole}
                    </p>
                  </div>
                  <Badge color={getRoleColor(key)} className="text-xs">
                    {key}
                  </Badge>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      {/* Lista użytkowników */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <Card.Title>
              Użytkownicy systemu ({filteredUsers.length})
            </Card.Title>
            <Input
              placeholder="Szukaj użytkownika..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </Card.Header>
        <Card.Content>
          <DataTable data={filteredUsers} columns={columns} pageSize={10} />
        </Card.Content>
      </Card>

      {/* Modal zmiany roli */}
      <Modal
        isOpen={roleModal.open}
        onClose={() => setRoleModal({ open: false, user: null })}
        title="Zmiana roli użytkownika"
      >
        <div className="space-y-4">
          {roleModal.user && (
            <>
              <div>
                <h3 className="font-medium mb-2">Użytkownik:</h3>
                <p>
                  {roleModal.user.firstName} {roleModal.user.lastName}
                </p>
                <p className="text-sm text-gray-500">{roleModal.user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nowa rola
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {Object.entries(roles).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Domyślne uprawnienia dla roli {roles[selectedRole]}:
                </p>
                <div className="text-xs text-blue-700">
                  {defaultRolePermissions[selectedRole]
                    ?.map((p) => permissions[p])
                    .join(", ")}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Zmiana roli automatycznie ustawi domyślne uprawnienia dla
                  tej roli. Można je później dostosować indywidualnie.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setRoleModal({ open: false, user: null })}
                  disabled={saving}
                >
                  Anuluj
                </Button>
                <Button
                  onClick={handleRoleChange}
                  disabled={saving || selectedRole === roleModal.user?.role}
                >
                  {saving ? <Spinner size="sm" /> : "Zmień rolę"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal edycji uprawnień */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, user: null })}
        title="Edycja uprawnień użytkownika"
        size="large"
      >
        <div className="space-y-4">
          {editModal.user && (
            <>
              <div>
                <h3 className="font-medium mb-2">Użytkownik:</h3>
                <p>
                  {editModal.user.firstName} {editModal.user.lastName}
                </p>
                <p className="text-sm text-gray-500">{editModal.user.email}</p>
                <Badge
                  color={getRoleColor(editModal.user.role)}
                  className="mt-1"
                >
                  {roles[editModal.user.role]}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium mb-3">Uprawnienia:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(permissionsByCategory).map(
                    ([category, categoryPermissions]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <span>{getCategoryIcon(category)}</span>
                          {getCategoryLabel(category)}
                        </h4>
                        <div className="space-y-2">
                          {categoryPermissions.map((permission) => {
                            const isDisabled =
                              permission === "admin:all" &&
                              editModal.user._id === user._id;
                            return (
                              <label
                                key={permission}
                                className="flex items-start"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(
                                    permission
                                  )}
                                  onChange={() => togglePermission(permission)}
                                  className="mr-3 mt-0.5"
                                  disabled={isDisabled}
                                />
                                <div>
                                  <span
                                    className={`text-sm ${
                                      isDisabled ? "text-gray-400" : ""
                                    }`}
                                  >
                                    {permissions[permission]}
                                  </span>
                                  {isDisabled && (
                                    <div className="text-xs text-gray-400">
                                      (nie można usunąć sobie tego uprawnienia)
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 font-mono">
                                    {permission}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Wybrano {selectedPermissions.length} uprawnień
                  {selectedPermissions.includes("admin:all") && (
                    <span className="ml-2 text-red-600 font-medium">
                      (Pełny dostęp)
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setEditModal({ open: false, user: null })}
                    disabled={saving}
                  >
                    Anuluj
                  </Button>
                  <Button onClick={handlePermissionsChange} disabled={saving}>
                    {saving ? <Spinner size="sm" /> : "Zapisz uprawnienia"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
