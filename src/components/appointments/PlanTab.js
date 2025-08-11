"use client";
import React, { useState } from "react";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function PlanTab({ appointment, onUpdate }) {
  const [plan, setPlan] = useState(
    appointment.plan || {
      shortTermGoals: [],
      longTermGoals: [],
      frequency: "",
      functionalTechniques: "",
      patientEducation: "",
      followUpPlan: "",
    }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setPlan((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    const arrayValue = value.split("\n").filter((item) => item.trim());
    setPlan((prev) => ({ ...prev, [field]: arrayValue }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ ...appointment, plan });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Plan leczenia</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Textarea
            label="Cele krótkoterminowe"
            value={plan.shortTermGoals?.join("\n")}
            onChange={(e) =>
              handleArrayChange("shortTermGoals", e.target.value)
            }
            rows={4}
            placeholder="Cele na najbliższe 2-4 tygodnie (każdy cel w nowej linii)&#10;Przykład:&#10;- Zmniejszenie bólu o 3 punkty na skali VAS&#10;- Zwiększenie zakresu ruchu w stawie kolanowym o 15°"
          />

          <Textarea
            label="Cele długoterminowe"
            value={plan.longTermGoals?.join("\n")}
            onChange={(e) => handleArrayChange("longTermGoals", e.target.value)}
            rows={4}
            placeholder="Cele końcowe terapii (każdy cel w nowej linii)&#10;Przykład:&#10;- Powrót do pełnej aktywności zawodowej&#10;- Samodzielne poruszanie się bez wsparcia"
          />

          <Input
            label="Częstotliwość terapii"
            value={plan.frequency}
            onChange={(e) => handleChange("frequency", e.target.value)}
            placeholder="np. 3x w tygodniu przez 4 tygodnie"
          />

          <Textarea
            label="Zaplanowane techniki funkcjonalne"
            value={plan.functionalTechniques}
            onChange={(e) =>
              handleChange("functionalTechniques", e.target.value)
            }
            rows={5}
            placeholder="Szczegółowy opis planowanych technik, ćwiczeń, zabiegów...&#10;Przykład:&#10;- Mobilizacja manualna stawu biodrowego&#10;- Ćwiczenia proprioceptywne&#10;- Trening funkcjonalny chodu"
          />

          <Textarea
            label="Edukacja pacjenta"
            value={plan.patientEducation}
            onChange={(e) => handleChange("patientEducation", e.target.value)}
            rows={4}
            placeholder="Informacje i zalecenia przekazane pacjentowi...&#10;Przykład:&#10;- Ergonomia miejsca pracy&#10;- Zasady aktywności fizycznej&#10;- Profilaktyka urazów"
          />

          <Textarea
            label="Plan kontroli i kolejnych wizyt"
            value={plan.followUpPlan}
            onChange={(e) => handleChange("followUpPlan", e.target.value)}
            rows={3}
            placeholder="Harmonogram wizyt kontrolnych, ocena postępów...&#10;Przykład:&#10;- Ocena po 2 tygodniach terapii&#10;- Modyfikacja planu w zależności od postępów"
          />
        </Card.Content>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Zapisz plan leczenia
        </Button>
      </div>
    </div>
  );
}
