import React from "react";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";

const UserTab = ({
  error,
  saving,
  success,
  handleSubmit,
  form,
  handleChange,
  handleRoleChange,
  availablePermissions,
  handlePermissionToggle,
  roleOptions,
}) => {
  const router = useRouter();

  return (
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
          {/* <div className="mt-6">
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
          </div> */}
          {error && (
            <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>
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
  );
};

export default UserTab;
