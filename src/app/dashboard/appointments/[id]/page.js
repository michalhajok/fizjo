"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAppointment,
  updateAppointment,
  getAuditLogsForAppointment,
  uploadAttachment,
} from "@/lib/api";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AuditTimeline from "@/components/ui/AuditTimeline";
import { getIcd9Procedures } from "@/lib/api";
import AutocompleteMultiSelect from "@/components/ui/AutocompleteMultiSelect";

const tabDefs = [
  { key: "examinations", label: "Badania kliniczne/obserwacje" },
  { key: "diagnoses", label: "Rozpoznania" },
  { key: "procedures", label: "Procedury" },
  { key: "attachments", label: "Załączniki" },
  { key: "notes", label: "Notatki" },
  { key: "plan", label: "Plan terapii" },
  { key: "recommendations", label: "Zalecenia" },
  { key: "history", label: "Historia zmian" },
];

export default function AppointmentDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [tab, setTab] = useState("examinations");
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [icd9Options, setIcd9Options] = useState([]);

  // Ładuj dane wizyty, historię audytu
  useEffect(() => {
    setLoading(true);
    getAppointment(id).then((res) => {
      setData(res.data?.data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (tab === "history" && logs.length === 0) {
      setAuditLoading(true);
      getAuditLogsForAppointment(id)
        .then((res) => {
          setLogs(res.data?.logs || []);
        })
        .finally(() => setAuditLoading(false));
    }
  }, [tab, id, logs.length]);

  useEffect(() => {
    // Pobieraj wszystkie procedury (albo tylko na wyszukiwanie frazy)
    getIcd9Procedures().then((res) => {
      setIcd9Options(
        (res.data?.data || []).map((proc) => ({
          value: proc.code,
          label: `${proc.code} - ${proc.name}`,
        }))
      );
    });
  }, []);

  if (loading || !data) {
    return <Spinner size="lg" text="Ładowanie wizyty…" />;
  }

  // --- Edycja poszczególnych sekcji ---
  const handleArrayChange = (section, idx, field, value) => {
    setData((prev) => {
      const arr = [...(prev[section] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [section]: arr };
    });
    setSuccess(false);
    setError(null);
  };

  const handleArrayStringChange = (section, idx, value) => {
    setData((prev) => {
      const arr = [...(prev[section] || [])];
      arr[idx] = value;
      return { ...prev, [section]: arr };
    });
    setSuccess(false);
    setError(null);
  };

  const handleArrayAdd = (section, defaultValue) => {
    setData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), defaultValue],
    }));
    setSuccess(false);
    setError(null);
  };

  const handleArrayRemove = (section, idx) => {
    setData((prev) => {
      const arr = [...(prev[section] || [])];
      arr.splice(idx, 1);
      return { ...prev, [section]: arr };
    });
    setSuccess(false);
    setError(null);
  };

  const handleSimpleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError(null);
  };

  // --- Zapisywanie zmian ---
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const updateFields = {
      examinations: data.examinations,
      diagnoses: data.diagnoses,
      procedures: data.procedures,
      attachments: data.attachments,
      notes: data.notes,
      therapyPlan: data.therapyPlan,
      recommendations: data.recommendations,
    };
    const { error } = await updateAppointment(id, updateFields);
    setSaving(false);
    if (error) setError(error);
    else setSuccess(true);
  };

  // --- Załączniki: prosty upload (stub, dopracuj z backendem!) ---
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadAttachment(id, file);
    if (res?.success && res.data) {
      setData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), res.data],
      }));
      setSuccess(true);
    }
  };

  // --- Zakładki ---
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-700">
          Wizyta: {new Date(data.scheduledDateTime).toLocaleString("pl-PL")}
        </h1>
        <p className="text-gray-600">
          Pacjent: {data.patient?.personalInfo?.firstName}{" "}
          {data.patient?.personalInfo?.lastName} | Usługa: {data.service?.name}
        </p>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={tabDefs.map((t) => ({ value: t.key, label: t.label }))}
      />

      {/* KAŻDA SEKCJA (zakładka) */}
      <Card>
        <Card.Content>
          {tab === "examinations" && (
            <section>
              <h2 className="font-semibold mb-3">
                Badania kliniczne / Obserwacje
              </h2>
              {(data.examinations ?? []).map((exam, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <Input
                    placeholder="Nazwa badania"
                    value={exam?.name || ""}
                    onChange={(e) =>
                      handleArrayChange(
                        "examinations",
                        i,
                        "name",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Wynik / Notatka"
                    value={exam?.result || ""}
                    onChange={(e) =>
                      handleArrayChange(
                        "examinations",
                        i,
                        "result",
                        e.target.value
                      )
                    }
                  />
                  <Button
                    type="button"
                    size="xs"
                    onClick={() => handleArrayRemove("examinations", i)}
                  >
                    Usuń
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  handleArrayAdd("examinations", { name: "", result: "" })
                }
              >
                Dodaj badanie
              </Button>
            </section>
          )}

          {tab === "diagnoses" && (
            <section>
              <h2 className="font-semibold mb-3">Rozpoznania</h2>
              {(data.diagnoses ?? []).map((diag, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <Input
                    placeholder="Kod (np. ICD-10)"
                    value={diag?.code || ""}
                    onChange={(e) =>
                      handleArrayChange("diagnoses", i, "code", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Opis rozpoznania"
                    value={diag?.description || ""}
                    onChange={(e) =>
                      handleArrayChange(
                        "diagnoses",
                        i,
                        "description",
                        e.target.value
                      )
                    }
                  />
                  <Button
                    type="button"
                    size="xs"
                    onClick={() => handleArrayRemove("diagnoses", i)}
                  >
                    Usuń
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  handleArrayAdd("diagnoses", { code: "", description: "" })
                }
              >
                Dodaj rozpoznanie
              </Button>
            </section>
          )}

          {tab === "procedures" && (
            <section>
              <h2 className="font-semibold mb-3">Procedury</h2>
              <AutocompleteMultiSelect
                label="Procedury (ICD-9)"
                options={icd9Options}
                value={(data.procedures || [])
                  .map((code) => icd9Options.find((o) => o.value === code))
                  .filter(Boolean)}
                onChange={(selected) =>
                  setData((prev) => ({
                    ...prev,
                    procedures: selected.map((opt) => opt.value),
                  }))
                }
                placeholder="Wyszukaj i wybierz procedury..."
              />
            </section>
          )}

          {tab === "attachments" && (
            <section>
              <h2 className="font-semibold mb-3">Załączniki / dokumenty</h2>
              <div className="mb-2">
                <input type="file" onChange={handleUpload} className="mb-2" />
              </div>
              <ul className="space-y-2">
                {(data.attachments ?? []).map((att, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {att.filename || att.url}
                    </a>
                    <Button
                      type="button"
                      size="xs"
                      onClick={() => handleArrayRemove("attachments", i)}
                    >
                      Usuń
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tab === "notes" && (
            <section>
              <h2 className="font-semibold mb-3">Notatki z wizyty</h2>
              <Textarea
                label="Notatki"
                value={data.notes || ""}
                onChange={(e) => handleSimpleChange("notes", e.target.value)}
                rows={8}
              />
            </section>
          )}

          {tab === "plan" && (
            <section>
              <h2 className="font-semibold mb-3">Plan terapii / cele</h2>
              <Textarea
                label="Plan terapii"
                value={data.therapyPlan || ""}
                onChange={(e) =>
                  handleSimpleChange("therapyPlan", e.target.value)
                }
                rows={6}
              />
            </section>
          )}

          {tab === "recommendations" && (
            <section>
              <h2 className="font-semibold mb-3">Zalecenia domowe / opieka</h2>
              <Textarea
                label="Zalecenia"
                value={data.recommendations || ""}
                onChange={(e) =>
                  handleSimpleChange("recommendations", e.target.value)
                }
                rows={6}
              />
            </section>
          )}

          {tab === "history" && (
            <section>
              <h2 className="font-semibold mb-3">Historia zmian (audit)</h2>
              {auditLoading ? (
                <Spinner size="md" text="Ładowanie historii..." />
              ) : logs.length ? (
                <AuditTimeline logs={logs} />
              ) : (
                <div className="text-gray-500">Brak historii.</div>
              )}
            </section>
          )}

          {/* Przycisk zapisu */}
          {(tab !== "history" && (
            <div className="flex justify-end gap-4 mt-6">
              {error && <span className="text-red-600">{error}</span>}
              {success && <span className="text-green-600">Zapisano!</span>}
              <Button type="button" onClick={handleSave} loading={saving}>
                Zapisz zmiany
              </Button>
            </div>
          )) ||
            null}
        </Card.Content>
      </Card>
    </div>
  );
}
