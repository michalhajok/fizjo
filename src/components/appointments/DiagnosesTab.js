"use client";
import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function DiagnosesTab({ appointment, onUpdate }) {
  const [diagnoses, setDiagnoses] = useState(appointment.diagnoses || []);

  const handleChange = (idx, field, value) => {
    const arr = [...diagnoses];
    arr[idx][field] = value;
    setDiagnoses(arr);
  };

  const handleAdd = () =>
    setDiagnoses((e) => [...e, { code: "", description: "" }]);
  const handleRemove = (idx) =>
    setDiagnoses((e) => e.filter((_, i) => i !== idx));

  const handleSave = () => onUpdate && onUpdate({ ...appointment, diagnoses });

  return (
    <div>
      {(diagnoses || []).map((diag, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <Input
            placeholder="Kod ICD10"
            value={diag.code || ""}
            onChange={(e) => handleChange(i, "code", e.target.value)}
          />
          <Input
            placeholder="Opis rozpoznania"
            value={diag.description || ""}
            onChange={(e) => handleChange(i, "description", e.target.value)}
          />
          <Button type="button" size="xs" onClick={() => handleRemove(i)}>
            Usuń
          </Button>
        </div>
      ))}
      <div className="mt-2 flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
          Dodaj rozpoznanie
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          Zapisz
        </Button>
      </div>
    </div>
  );
}
