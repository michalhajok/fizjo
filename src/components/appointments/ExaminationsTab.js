"use client";
import React, { useState } from "react";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const testResults = [
  { value: "positive", label: "Dodatni" },
  { value: "negative", label: "Ujemny" },
  { value: "inconclusive", label: "Niejednoznaczny" },
];

const muscleStrengthGrades = [
  { value: "0", label: "0 - Brak skurczu" },
  { value: "1", label: "1 - Ślad skurczu" },
  { value: "2", label: "2 - Ruch bez oporu grawitacji" },
  { value: "3", label: "3 - Ruch przeciw grawitacji" },
  { value: "4", label: "4 - Ruch przeciw niewielkiemu oporowi" },
  { value: "5", label: "5 - Normalna siła" },
];

export default function ExaminationsTab({ appointment, onUpdate }) {
  const [examinations, setExaminations] = useState(
    appointment.examinations || {
      examinations: "",
      palpation: "",
      rangeOfMotion: [],
      muscleStrength: [],
      posturalAssessment: "",
      gaitAnalysis: "",
      specialTests: [],
      conclusions: "",
      scales: [],
      attachments: [],
    }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setExaminations((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field, defaultItem) => {
    setExaminations((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultItem],
    }));
  };

  const handleArrayUpdate = (field, index, value) => {
    setExaminations((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleArrayRemove = (field, index) => {
    setExaminations((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ ...appointment, examinations });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Badanie fizjoterapeutyczne</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Textarea
            label="Badanie ogólne"
            value={examinations.examinations}
            onChange={(e) => handleChange("examinations", e.target.value)}
            rows={4}
            placeholder="Obserwacja ogólna, postawa, deformacje..."
          />

          <Textarea
            label="Palpacja"
            value={examinations.palpation}
            onChange={(e) => handleChange("palpation", e.target.value)}
            rows={3}
            placeholder="Tkliwość, napięcie mięśni, temperatura, obrzęki..."
          />

          {/* Zakres ruchu */}
          <div>
            <label className="block font-medium mb-2">Zakres ruchu</label>
            {examinations.rangeOfMotion?.map((rom, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <Input
                  placeholder="Staw"
                  value={rom.joint || ""}
                  onChange={(e) =>
                    handleArrayUpdate("rangeOfMotion", index, {
                      ...rom,
                      joint: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Ruch"
                  value={rom.movement || ""}
                  onChange={(e) =>
                    handleArrayUpdate("rangeOfMotion", index, {
                      ...rom,
                      movement: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Stopnie"
                  value={rom.degrees || ""}
                  onChange={(e) =>
                    handleArrayUpdate("rangeOfMotion", index, {
                      ...rom,
                      degrees: Number(e.target.value),
                    })
                  }
                />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleArrayRemove("rangeOfMotion", index)}
                >
                  Usuń
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleArrayAdd("rangeOfMotion", {
                  joint: "",
                  movement: "",
                  degrees: 0,
                })
              }
            >
              Dodaj pomiar ROM
            </Button>
          </div>

          {/* Siła mięśniowa */}
          <div>
            <label className="block font-medium mb-2">Siła mięśniowa</label>
            {examinations.muscleStrength?.map((strength, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <Input
                  placeholder="Mięsień/grupa"
                  value={strength.muscle || ""}
                  onChange={(e) =>
                    handleArrayUpdate("muscleStrength", index, {
                      ...strength,
                      muscle: e.target.value,
                    })
                  }
                />
                <Select
                  placeholder="Ocena"
                  options={muscleStrengthGrades}
                  value={muscleStrengthGrades.find(
                    (g) => g.value === strength.grade
                  )}
                  onChange={(option) =>
                    handleArrayUpdate("muscleStrength", index, {
                      ...strength,
                      grade: option.value,
                    })
                  }
                />
                <Input
                  placeholder="Uwagi"
                  value={strength.notes || ""}
                  onChange={(e) =>
                    handleArrayUpdate("muscleStrength", index, {
                      ...strength,
                      notes: e.target.value,
                    })
                  }
                />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleArrayRemove("muscleStrength", index)}
                >
                  Usuń
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleArrayAdd("muscleStrength", {
                  muscle: "",
                  grade: "5",
                  notes: "",
                })
              }
            >
              Dodaj test siły
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Ocena postawy"
              value={examinations.posturalAssessment}
              onChange={(e) =>
                handleChange("posturalAssessment", e.target.value)
              }
              rows={3}
              placeholder="Asymetrie, deformacje, kompensacje..."
            />

            <Textarea
              label="Analiza chodu"
              value={examinations.gaitAnalysis}
              onChange={(e) => handleChange("gaitAnalysis", e.target.value)}
              rows={3}
              placeholder="Wzorzec chodu, kulanie, wspomaganie..."
            />
          </div>

          {/* Testy specjalne */}
          <div>
            <label className="block font-medium mb-2">Testy specjalne</label>
            {examinations.specialTests?.map((test, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <Input
                  placeholder="Nazwa testu"
                  value={test.testName || ""}
                  onChange={(e) =>
                    handleArrayUpdate("specialTests", index, {
                      ...test,
                      testName: e.target.value,
                    })
                  }
                />
                <Select
                  placeholder="Wynik"
                  options={testResults}
                  value={testResults.find((r) => r.value === test.result)}
                  onChange={(option) =>
                    handleArrayUpdate("specialTests", index, {
                      ...test,
                      result: option.value,
                    })
                  }
                />
                <Input
                  placeholder="Uwagi"
                  value={test.notes || ""}
                  onChange={(e) =>
                    handleArrayUpdate("specialTests", index, {
                      ...test,
                      notes: e.target.value,
                    })
                  }
                />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleArrayRemove("specialTests", index)}
                >
                  Usuń
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleArrayAdd("specialTests", {
                  testName: "",
                  result: "negative",
                  notes: "",
                })
              }
            >
              Dodaj test
            </Button>
          </div>

          <Textarea
            label="Wnioski z badania"
            value={examinations.conclusions}
            onChange={(e) => handleChange("conclusions", e.target.value)}
            rows={4}
            placeholder="Podsumowanie wyników badania, główne problemy..."
          />
        </Card.Content>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Zapisz badanie
        </Button>
      </div>
    </div>
  );
}
