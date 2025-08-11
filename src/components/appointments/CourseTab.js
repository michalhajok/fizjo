"use client";
import React, { useState } from "react";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AutocompleteMultiSelect from "@/components/ui/AutocompleteMultiSelect";

export default function CourseTab({ appointment, procedures = [], onUpdate }) {
  const [course, setCourse] = useState(
    appointment.course || {
      activitiesPerformed: "",
      patientResponse: "",
      homeExerciseProgram: [],
      proceduresPerformed: [],
      comments: "",
    }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const handleExerciseAdd = () => {
    setCourse((prev) => ({
      ...prev,
      homeExerciseProgram: [
        ...prev.homeExerciseProgram,
        {
          exercise: "",
          description: "",
          sets: 1,
          reps: 10,
          holdTime: "",
          frequency: "",
          instructions: "",
        },
      ],
    }));
  };

  const handleExerciseUpdate = (index, field, value) => {
    setCourse((prev) => {
      const newExercises = [...prev.homeExerciseProgram];
      newExercises[index] = { ...newExercises[index], [field]: value };
      return { ...prev, homeExerciseProgram: newExercises };
    });
  };

  const handleExerciseRemove = (index) => {
    setCourse((prev) => ({
      ...prev,
      homeExerciseProgram: prev.homeExerciseProgram.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ ...appointment, course });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Przebieg leczenia</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Textarea
            label="Wykonane czynności terapeutyczne"
            value={course.activitiesPerformed}
            onChange={(e) =>
              handleChange("activitiesPerformed", e.target.value)
            }
            rows={5}
            placeholder="Szczegółowy opis wykonanych zabiegów, ćwiczeń, technik...&#10;Przykład:&#10;- Mobilizacja stawu biodrowego - 15 min&#10;- Ćwiczenia wzmacniające mięśnie pośladkowe - 3 serie po 15 powtórzeń&#10;- Terapia manualna kręgosłupa lędźwiowego"
          />

          <Textarea
            label="Reakcja pacjenta na terapię"
            value={course.patientResponse}
            onChange={(e) => handleChange("patientResponse", e.target.value)}
            rows={3}
            placeholder="Obserwacje dotyczące tolerancji zabiegu, bólu podczas ćwiczeń, ogólnego samopoczucia...&#10;Przykład:&#10;- Dobra tolerancja zabiegów&#10;- Zgłaszany ból podczas ćwiczeń na poziomie 3/10 VAS&#10;- Poprawa nastroju, większa motywacja"
          />

          {/* Procedury ICD-9 */}
          <AutocompleteMultiSelect
            label="Wykonane procedury (ICD-9)"
            options={procedures.map((p) => ({
              value: p._id,
              label: `${p.code} - ${p.name}`,
            }))}
            value={course.proceduresPerformed
              ?.map((id) => procedures.find((p) => p._id === id))
              .filter(Boolean)
              .map((p) => ({ value: p._id, label: `${p.code} - ${p.name}` }))}
            onChange={(selected) =>
              handleChange(
                "proceduresPerformed",
                selected.map((s) => s.value)
              )
            }
            placeholder="Wyszukaj i wybierz wykonane procedury..."
          />

          {/* Program ćwiczeń domowych */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block font-medium">
                Program ćwiczeń domowych
              </label>
              <Button size="sm" variant="outline" onClick={handleExerciseAdd}>
                Dodaj ćwiczenie
              </Button>
            </div>

            {course.homeExerciseProgram?.map((exercise, index) => (
              <Card key={index} className="mb-4">
                <Card.Content>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="Nazwa ćwiczenia"
                        value={exercise.exercise}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            index,
                            "exercise",
                            e.target.value
                          )
                        }
                        placeholder="np. Przyciąganie kolana do klatki piersiowej"
                      />
                      <Input
                        label="Częstotliwość"
                        value={exercise.frequency}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            index,
                            "frequency",
                            e.target.value
                          )
                        }
                        placeholder="np. 2x dziennie"
                      />
                    </div>

                    <Textarea
                      label="Opis ćwiczenia"
                      value={exercise.description}
                      onChange={(e) =>
                        handleExerciseUpdate(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                      placeholder="Szczegółowy opis wykonania ćwiczenia..."
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Serie"
                        type="number"
                        value={exercise.sets}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            index,
                            "sets",
                            Number(e.target.value)
                          )
                        }
                        min="1"
                      />
                      <Input
                        label="Powtórzenia"
                        type="number"
                        value={exercise.reps}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            index,
                            "reps",
                            Number(e.target.value)
                          )
                        }
                        min="1"
                      />
                      <Input
                        label="Czas utrzymania"
                        value={exercise.holdTime}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            index,
                            "holdTime",
                            e.target.value
                          )
                        }
                        placeholder="np. 10 sekund"
                      />
                    </div>

                    <Textarea
                      label="Instrukcje szczególne"
                      value={exercise.instructions}
                      onChange={(e) =>
                        handleExerciseUpdate(
                          index,
                          "instructions",
                          e.target.value
                        )
                      }
                      rows={2}
                      placeholder="Dodatkowe wskazówki, ostrzeżenia, modyfikacje..."
                    />

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleExerciseRemove(index)}
                      >
                        Usuń ćwiczenie
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>

          <Textarea
            label="Dodatkowe komentarze"
            value={course.comments}
            onChange={(e) => handleChange("comments", e.target.value)}
            rows={3}
            placeholder="Inne obserwacje, uwagi dotyczące przebiegu terapii, rekomendacje na przyszłość..."
          />
        </Card.Content>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Zapisz przebieg leczenia
        </Button>
      </div>
    </div>
  );
}
