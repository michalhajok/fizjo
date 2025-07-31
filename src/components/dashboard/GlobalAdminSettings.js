import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { getGlobalSettings, updateGlobalSettings } from "@/lib/api";

export function GlobalAdminSettings() {
  const [form, setForm] = useState({
    companyName: "",
    logoUrl: "",
    maxPatientsPerUser: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Pobierz aktualne ustawienia przy pierwszym renderze
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getGlobalSettings().then(({ data, error }) => {
      if (mounted) {
        if (data) {
          setForm({
            companyName: data.companyName || "",
            logoUrl: data.logoUrl || "",
            maxPatientsPerUser: data.maxPatientsPerUser || 100,
          });
        }
        setApiError(error || null);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setApiError(null);
    setSuccess(false);
    const { error } = await updateGlobalSettings(form);
    setSaving(false);
    if (error) {
      setApiError(error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <Card className="mt-8">
      <Card.Header>
        <Card.Title>Ustawienia globalne (administrator)</Card.Title>
      </Card.Header>
      <Card.Content>
        {loading ? (
          <Spinner size="md" text="Ładowanie ustawień globalnych..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nazwa firmy"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
            />
            <Input
              label="Logo (URL do pliku)"
              name="logoUrl"
              value={form.logoUrl}
              onChange={handleChange}
              placeholder="https://adres-do-logo.pl/logo.png"
            />
            <Input
              label="Maksymalna liczba pacjentów na użytkownika"
              name="maxPatientsPerUser"
              type="number"
              min={1}
              value={form.maxPatientsPerUser}
              onChange={handleChange}
              required
            />

            {apiError && <div className="text-red-600 text-sm">{apiError}</div>}
            {success && (
              <div className="text-green-600 text-sm">
                Zmiany zostały zapisane!
              </div>
            )}
            <div className="flex justify-end gap-4">
              <Button type="submit" loading={saving}>
                Zapisz ustawienia
              </Button>
            </div>
          </form>
        )}
      </Card.Content>
    </Card>
  );
}
