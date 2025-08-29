// src/app/dashboard/admin/settings/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { getGlobalSettings, updateGlobalSettings } from "@/lib/api";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Checkbox from "@/components/ui/Checkbox";

/* ----- słowniki & stałe ----- */
const tzOptions = [
  { value: "Europe/Warsaw", label: "Warszawa (CET)" },
  { value: "Europe/London", label: "Londyn (GMT)" },
  { value: "America/New_York", label: "Nowy Jork (EST)" },
];

const backupFreqOptions = [
  { value: "daily", label: "Codzienne" },
  { value: "weekly", label: "Cotygodniowe" },
  { value: "monthly", label: "Comiesięczne" },
];

/* ----- komponent ----- */
export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /* pobierz ustawienia przy mount */
  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      getGlobalSettings()
        .then(({ data, error }) => {
          if (error) setError(error);
          else setForm(data?.data); // zakładamy, że backend zwraca gotowy obiekt
        })
        .finally(() => setLoading(false));
    } else if (!authLoading && user?.role !== "admin") {
      router.replace("/dashboard"); // brak uprawnień
    }
  }, [authLoading, user, router]);

  /* handlery */
  const handleChange = ({ target }) => {
    const { name, type, checked, value } = target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : /^(max|timeout|days|hours)/.test(name) // pola liczbowe
          ? +value
          : value,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSelect = (field) => (opt) => {
    setForm((prev) => ({ ...prev, [field]: opt.value }));
    setError(null);
    setSuccess(false);
  };

  console.log(form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateGlobalSettings(form);
    setSaving(false);
    if (error) setError(error);
    else setSuccess(true);
  };

  /* widok ładowania */
  if (loading || authLoading || !form)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" text="Ładowanie ustawień…" />
      </div>
    );

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-700">
          Ustawienia globalne
        </h1>
        <Button form="settings-form" type="submit" loading={saving}>
          Zapisz zmiany
        </Button>
      </div>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
        {/* --- firma --- */}
        <Card>
          <Card.Header>
            <Card.Title>Informacje o firmie</Card.Title>
          </Card.Header>
          <Card.Content className="grid md:grid-cols-2 gap-4">
            <Input
              label="Nazwa firmy"
              name="clinicName"
              value={form.clinicName || ""}
              onChange={handleChange}
              required
            />
            <Input
              label="Telefon"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
            />
            <Input
              label="Logo (URL)"
              name="logoUrl"
              value={form.logoUrl || ""}
              onChange={handleChange}
            />
          </Card.Content>
        </Card>

        {/* --- system --- */}
        <Card>
          <Card.Header>
            <Card.Title>Ustawienia systemowe</Card.Title>
          </Card.Header>
          <Card.Content className="grid md:grid-cols-2 gap-4">
            <Input
              label="Max pacjentów / użytk."
              name="maxPatientsPerUser"
              type="number"
              min={1}
              value={form.maxPatientsPerUser || 100}
              onChange={handleChange}
            />
            <Input
              label="Domyślny czas wizyty (min)"
              name="defaultAppointmentDuration"
              type="number"
              min={15}
              value={form.defaultAppointmentDuration || 60}
              onChange={handleChange}
            />
            <Select
              label="Strefa czasowa"
              options={tzOptions}
              value={tzOptions.find((o) => o.value === form.timezone)}
              onChange={handleSelect("timezone")}
            />
            <Input
              label="Format daty"
              name="dateFormat"
              value={form.dateFormat || "DD/MM/YYYY"}
              onChange={handleChange}
            />
          </Card.Content>
        </Card>

        {/* --- powiadomienia --- */}
        <Card>
          <Card.Header>
            <Card.Title>Powiadomienia</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="flex gap-6">
              <Checkbox
                label="Email"
                checked={form.emailNotifications}
                onChange={handleChange}
                name="emailNotifications"
              />
              <Checkbox
                label="SMS"
                checked={form.smsNotifications}
                onChange={handleChange}
                name="smsNotifications"
              />
            </div>
            <Input
              label="Przypomnienie (godziny wcześniej)"
              name="reminderAdvanceHours"
              type="number"
              min={1}
              max={168}
              value={form.reminderAdvanceHours || 24}
              onChange={handleChange}
            />
          </Card.Content>
        </Card>

        {/* --- kopie zapasowe --- */}
        <Card>
          <Card.Header>
            <Card.Title>Kopie zapasowe</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Checkbox
              label="Włącz automatyczne kopie"
              checked={form.autoBackup}
              name="autoBackup"
              onChange={handleChange}
            />
            {form.autoBackup && (
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Częstotliwość"
                  options={backupFreqOptions}
                  value={backupFreqOptions.find(
                    (o) => o.value === form.backupFrequency
                  )}
                  onChange={handleSelect("backupFrequency")}
                />
                <Input
                  label="Retencja (dni)"
                  name="backupRetentionDays"
                  type="number"
                  min={7}
                  max={365}
                  value={form.backupRetentionDays || 30}
                  onChange={handleChange}
                />
              </div>
            )}
          </Card.Content>
        </Card>

        {/* --- bezpieczeństwo --- */}
        <Card>
          <Card.Header>
            <Card.Title>Bezpieczeństwo</Card.Title>
          </Card.Header>
          <Card.Content className="grid md:grid-cols-3 gap-4">
            <Input
              label="Timeout sesji (min)"
              name="sessionTimeout"
              type="number"
              min={15}
              max={1440}
              value={form.sessionTimeout || 480}
              onChange={handleChange}
            />
            <Input
              label="Wygaśnięcie hasła (dni)"
              name="passwordExpiryDays"
              type="number"
              min={30}
              max={365}
              value={form.passwordExpiryDays || 90}
              onChange={handleChange}
            />
            <Input
              label="Limit prób logowania"
              name="loginAttemptsLimit"
              type="number"
              min={3}
              max={10}
              value={form.loginAttemptsLimit || 5}
              onChange={handleChange}
            />
          </Card.Content>
        </Card>

        {/* --- GDPR --- */}
        <Card>
          <Card.Header>
            <Card.Title>GDPR / RODO</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Checkbox
              label="Włącz tryb RODO"
              checked={form.gdprCompliance}
              name="gdprCompliance"
              onChange={handleChange}
            />
            {form.gdprCompliance && (
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Przechowywanie danych (lata)"
                  name="dataRetentionYears"
                  type="number"
                  min={1}
                  max={50}
                  value={form.dataRetentionYears || 20}
                  onChange={handleChange}
                />
                <Input
                  label="Anonimizacja po (dni)"
                  name="anonymizeAfterDays"
                  type="number"
                  min={30}
                  max={3650}
                  value={form.anonymizeAfterDays || 365}
                  onChange={handleChange}
                />
              </div>
            )}
          </Card.Content>
        </Card>

        {/* komunikaty */}
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Zapisano pomyślnie ✓</p>}
      </form>
    </div>
  );
}
