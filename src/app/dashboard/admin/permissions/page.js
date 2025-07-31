// src/app/dashboard/admin/permissions/page.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import { getPermissions, updatePermissions } from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";

export default function PermissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useApiFetch(
    getPermissions,
    [],
    true
  );

  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load fetched permissions into local state
  useEffect(() => {
    if (data?.permissions) {
      setPermissions(data.permissions);
    }
  }, [data]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" text="Ładowanie uprawnień..." />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Brak uprawnień</h1>
        <p className="text-gray-600">
          Sekcja dostępna tylko dla administratorów.
        </p>
      </div>
    );
  }

  const handleToggle = (perm) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.name === perm.name ? { ...p, enabled: !p.enabled } : p
      )
    );
    setSuccess(false);
    setApiError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setApiError(null);
    setSuccess(false);
    const payload = permissions.map(({ name, enabled }) => ({ name, enabled }));
    const { error } = await updatePermissions(payload);
    setSaving(false);
    if (error) {
      setApiError(error);
    } else {
      setSuccess(true);
      refetch();
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-gray-700">
        Uprawnienia użytkowników
      </h1>

      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((perm) => (
              <label key={perm.name} className="flex items-center space-x-2">
                <Checkbox
                  checked={perm.enabled}
                  onChange={() => handleToggle(perm)}
                />

                <span className="font-medium">{perm.displayName}</span>
                <span className="text-sm text-gray-500">({perm.name})</span>
              </label>
            ))}
          </div>
        </Card.Content>
      </Card>

      {apiError && <div className="text-red-600">{apiError}</div>}
      {success && (
        <div className="text-green-600">
          Zmiany w uprawnieniach zapisane pomyślnie!
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Zapisz zmiany
        </Button>
      </div>
    </div>
  );
}
