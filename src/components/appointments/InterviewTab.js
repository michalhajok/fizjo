"use client";
import React, { useState } from "react";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FileUpload from "@/components/ui/FileUpload";

export default function InterviewTab({ appointment, onUpdate }) {
  const [interview, setInterview] = useState(
    appointment.interview || {
      pastIllnesses: "",
      cooccurringDiseases: "",
      operations: "",
      medicines: "",
      allergies: "",
      currentAilments: "",
      earlierTreatment: "",
      styleLife: "",
      physicalActivity: "",
      diet: "",
      work: "",
      expectations: "",
      attachments: [],
    }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setInterview((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ ...appointment, interview });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (file) => {
    // Tu dodaj logikę uploadu - można użyć uploadAttachment z API
    setInterview((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          url: URL.createObjectURL(file),
          filename: file.name,
          mimetype: file.type,
          category: "document",
          uploadedAt: new Date(),
        },
      ],
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Wywiad z pacjentem</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Przebyte choroby"
              value={interview.pastIllnesses}
              onChange={(e) => handleChange("pastIllnesses", e.target.value)}
              rows={3}
              placeholder="Wcześniejsze choroby, urazy..."
            />

            <Textarea
              label="Choroby współistniejące"
              value={interview.cooccurringDiseases}
              onChange={(e) =>
                handleChange("cooccurringDiseases", e.target.value)
              }
              rows={3}
              placeholder="Aktualne schorzenia..."
            />

            <Textarea
              label="Operacje"
              value={interview.operations}
              onChange={(e) => handleChange("operations", e.target.value)}
              rows={2}
              placeholder="Przebyte zabiegi operacyjne..."
            />

            <Textarea
              label="Leki"
              value={interview.medicines}
              onChange={(e) => handleChange("medicines", e.target.value)}
              rows={2}
              placeholder="Przyjmowane leki..."
            />

            <Textarea
              label="Alergie"
              value={interview.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
              rows={2}
              placeholder="Alergie na leki, substancje..."
            />

            <Textarea
              label="Aktualne dolegliwości"
              value={interview.currentAilments}
              onChange={(e) => handleChange("currentAilments", e.target.value)}
              rows={3}
              placeholder="Obecne objawy, ból, ograniczenia..."
            />
          </div>

          <Textarea
            label="Wcześniejsze leczenie"
            value={interview.earlierTreatment}
            onChange={(e) => handleChange("earlierTreatment", e.target.value)}
            rows={3}
            placeholder="Dotychczasowa rehabilitacja, fizjoterapia..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Styl życia"
              value={interview.styleLife}
              onChange={(e) => handleChange("styleLife", e.target.value)}
              rows={2}
              placeholder="Tryb życia, nawyki..."
            />

            <Textarea
              label="Aktywność fizyczna"
              value={interview.physicalActivity}
              onChange={(e) => handleChange("physicalActivity", e.target.value)}
              rows={2}
              placeholder="Sport, ćwiczenia, aktywność zawodowa..."
            />

            <Textarea
              label="Dieta"
              value={interview.diet}
              onChange={(e) => handleChange("diet", e.target.value)}
              rows={2}
              placeholder="Sposób odżywiania, diety specjalne..."
            />

            <Textarea
              label="Praca"
              value={interview.work}
              onChange={(e) => handleChange("work", e.target.value)}
              rows={2}
              placeholder="Zawód, obciążenia zawodowe..."
            />
          </div>

          <Textarea
            label="Oczekiwania pacjenta"
            value={interview.expectations}
            onChange={(e) => handleChange("expectations", e.target.value)}
            rows={3}
            placeholder="Cele rehabilitacji, oczekiwania..."
          />

          {/* Załączniki do wywiadu */}
          <div>
            <label className="block font-medium mb-2">
              Załączniki do wywiadu
            </label>
            <FileUpload onUpload={handleFileUpload} />
            {interview.attachments?.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 mt-2">
                <span className="text-sm">{att.filename}</span>
                <Button
                  size="xs"
                  variant="danger"
                  onClick={() =>
                    handleChange(
                      "attachments",
                      interview.attachments.filter((_, i) => i !== idx)
                    )
                  }
                >
                  Usuń
                </Button>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Zapisz wywiad
        </Button>
      </div>
    </div>
  );
}
