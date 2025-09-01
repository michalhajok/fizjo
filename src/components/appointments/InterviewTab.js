"use client";
import React, { useState } from "react";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FileUpload from "@/components/ui/FileUpload";
import { uploadAttachment, deleteAttachment } from "@/lib/api";

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
      age: "",
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

  const handleFileDelete = async (attachmentId) => {
    if (!appointment._id) {
      alert("Nie można usunąć załącznika: brak ID wizyty");
      return;
    }
    try {
      const result = await deleteAttachment(appointment._id, attachmentId);
      console.log("Delete result:", result);
      if (result.data.success) {
        setInterview((prev) => ({
          ...prev,
          attachments: prev.attachments.filter(
            (att) => att.id !== attachmentId
          ),
        }));
      } else {
        alert("Nie udało się usunąć załącznika");
      }
    } catch (err) {
      console.error("Error deleting attachment:", err);
      alert("Wystąpił błąd podczas usuwania załącznika");
    }
  };

  const handleFileUpload = async (file) => {
    // Walidacja pliku
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    // Sprawdź rozmiar pliku
    if (file.size > maxSizeInBytes) {
      alert(`Plik jest za duży. Maksymalny rozmiar to ${maxSizeInMB}MB`);
      return;
    }

    // Sprawdź typ pliku
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Nieobsługiwany format pliku. Dozwolone: PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX"
      );
      return;
    }

    // Wyznacz kategorię na podstawie typu pliku
    const getFileCategory = (mimeType) => {
      if (mimeType.startsWith("image/")) return "image";
      if (mimeType === "application/pdf") return "pdf";
      if (mimeType.includes("word") || mimeType.includes("document"))
        return "document";
      if (mimeType.includes("excel") || mimeType.includes("sheet"))
        return "spreadsheet";
      return "document";
    };

    // Tymczasowy obiekt załącznika z URL podglądu
    const tempAttachment = {
      id: `temp-${Date.now()}`,
      url: URL.createObjectURL(file),
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      category: getFileCategory(file.type),
      uploadedAt: new Date(),
      uploading: true,
      file: file, // Zachowaj referencję do oryginalnego pliku
    };

    // Dodaj tymczasowy załącznik do stanu
    setInterview((prev) => ({
      ...prev,
      attachments: [...prev.attachments, tempAttachment],
    }));

    try {
      // Upload pliku przez API używając istniejącej funkcji
      // Używamy appointment.id jako appointmentId
      const result = await uploadAttachment(appointment._id, file);
      console.log("Upload result:", result);

      if (!result.success && result.error) {
        // Usuń tymczasowy załącznik w przypadku błędu
        setInterview((prev) => ({
          ...prev,
          attachments: prev.attachments.filter(
            (att) => att.id !== tempAttachment.id
          ),
        }));

        alert(`Błąd uploadu pliku: ${result.error}`);
        // Zwolnij tymczasowy URL
        URL.revokeObjectURL(tempAttachment.url);
        return;
      }

      // Zaktualizuj załącznik z danymi z serwera
      setInterview((prev) => ({
        ...prev,
        attachments: prev.attachments.map((att) =>
          att.id === tempAttachment.id
            ? {
                ...att,
                id: result.data?.id || result.id, // Dostosuj do struktury odpowiedzi z backend
                url: result.data?.url || result.url,
                uploading: false,
                uploadedAt:
                  result.data?.uploadedAt || result.uploadedAt || new Date(),
                // Usuń tymczasowe właściwości
                file: undefined,
              }
            : att
        ),
      }));

      // Zwolnij tymczasowy URL
      URL.revokeObjectURL(tempAttachment.url);
    } catch (err) {
      console.error("Error uploading file:", err);

      // Usuń tymczasowy załącznik w przypadku błędu
      setInterview((prev) => ({
        ...prev,
        attachments: prev.attachments.filter(
          (att) => att.id !== tempAttachment.id
        ),
      }));

      // Zwolnij tymczasowy URL
      URL.revokeObjectURL(tempAttachment.url);

      alert("Wystąpił błąd podczas uploadu pliku");
    }
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
              label="Wiek"
              value={interview.age}
              onChange={(e) => handleChange("age", e.target.value)}
              rows={2}
              placeholder="Wiek..."
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
            <FileUpload onFileSelect={handleFileUpload} />
            {interview.attachments?.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 mt-2">
                <span className="text-sm">{att.filename}</span>
                <Button
                  size="xs"
                  variant="danger"
                  onClick={() => handleFileDelete(att._id)}
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
