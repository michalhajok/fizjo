"use client";

import { useState, useEffect } from "react";
import { ICF_CATEGORIES, ICF_CORE_SETS } from "@/data/icfCategories";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Tabs from "@/components/ui/Tabs";
import CategorySection from "./CategorySection";

export default function ICFAssessment({
  patientId,
  appointmentId,
  initialData = {},
  onSave,
  readOnly = false,
}) {
  const [selectedCoreSet, setSelectedCoreSet] = useState("");
  const [icfAssessment, setICFAssessment] = useState({
    coreSet: "",
    body_functions: {},
    body_structures: {},
    activities_participation: {},
    environmental_factors: {},
    additionalNotes: "",
    assessmentDate: new Date(),
    assessor: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("body_functions");

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setICFAssessment((prev) => ({ ...prev, ...initialData }));
      if (initialData.coreSet) {
        setSelectedCoreSet(initialData.coreSet);
      }
    }
  }, [initialData]);

  // Ładowanie Core Set - resetuje i ustawia odpowiednie kategorie
  const loadCoreSet = (coreSetKey) => {
    if (!coreSetKey || coreSetKey === "custom") return;

    const coreSet = ICF_CORE_SETS[coreSetKey];
    if (!coreSet) return;

    const newAssessment = {
      ...icfAssessment,
      coreSet: coreSetKey,
      body_functions: {},
      body_structures: {},
      activities_participation: {},
      environmental_factors: {},
    };

    coreSet.categories.forEach((code) => {
      const category = findCategoryByCode(code);
      if (category) {
        const categoryType = category.category;
        newAssessment[categoryType] = {
          ...newAssessment[categoryType],
          [code]: { code, qualifier: "0", notes: "" },
        };
      }
    });

    setICFAssessment(newAssessment);
  };

  // Znalezienie kategorii po kodzie
  const findCategoryByCode = (code) => {
    for (const categoryType of Object.keys(ICF_CATEGORIES)) {
      const category = ICF_CATEGORIES[categoryType][code];
      if (category) return category;
    }
    return null;
  };

  // Aktualizacja oceny
  const updateICFItem = (categoryType, code, field, value) => {
    if (readOnly) return;
    setICFAssessment((prev) => ({
      ...prev,
      [categoryType]: {
        ...prev[categoryType],
        [code]: {
          ...prev[categoryType][code],
          [field]: value,
        },
      },
    }));
  };

  // Dodanie kategorii
  const addICFCategory = (categoryType, code) => {
    if (readOnly) return;
    const category = ICF_CATEGORIES[categoryType][code];
    if (!category) return;
    setICFAssessment((prev) => ({
      ...prev,
      [categoryType]: {
        ...prev[categoryType],
        [code]: { code, qualifier: "0", notes: "" },
      },
    }));
  };

  // Usunięcie kategorii
  const removeICFCategory = (categoryType, code) => {
    if (readOnly) return;
    setICFAssessment((prev) => {
      const updated = { ...prev };
      delete updated[categoryType][code];
      return updated;
    });
  };

  // Filtrowanie kategorii na podstawie wyszukiwania
  const filterCategories = (categories = {}, searchTerm) => {
    const entries = Object.entries(categories);
    if (!searchTerm) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(
      ([code, category]) =>
        code.toLowerCase().includes(term) ||
        category.title.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term)
    );
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...icfAssessment,
        patientId,
        appointmentId,
      });
    }
  };

  console.log("ICF Assessment State:", icfAssessment.assessmentDate);

  // Podsumowanie oceny
  const generateICFSummary = () => {
    const summary = {
      totalCategories: 0,
      problemCategories: 0,
      barrierFactors: 0,
      facilitatorFactors: 0,
    };

    Object.values(icfAssessment.body_functions || {}).forEach((item) => {
      summary.totalCategories++;
      if (parseInt(item.qualifier) >= 2) summary.problemCategories++;
    });
    Object.values(icfAssessment.body_structures || {}).forEach((item) => {
      summary.totalCategories++;
      if (parseInt(item.qualifier) >= 2) summary.problemCategories++;
    });
    Object.values(icfAssessment.activities_participation || {}).forEach(
      (item) => {
        summary.totalCategories++;
        if (parseInt(item.qualifier) >= 2) summary.problemCategories++;
      }
    );
    Object.values(icfAssessment.environmental_factors || {}).forEach((item) => {
      summary.totalCategories++;
      const qualifier = item.qualifier;
      if (qualifier.startsWith("-")) summary.barrierFactors++;
      if (qualifier.startsWith("+")) summary.facilitatorFactors++;
    });

    return summary;
  };

  const tabs = [
    { key: "body_functions", label: "Funkcje organizmu" },
    { key: "body_structures", label: "Struktury organizmu" },
    { key: "activities_participation", label: "Aktywności i uczestnictwo" },
    { key: "environmental_factors", label: "Czynniki środowiskowe" },
  ];

  const coreSetOptions = [
    { value: "", label: "Wybierz Core Set" },
    { value: "custom", label: "Niestandardowa ocena ICF" },
    ...Object.entries(ICF_CORE_SETS).map(([key, set]) => ({
      value: key,
      label: set.name,
    })),
  ];

  const summary = generateICFSummary();

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-semibold">
                Ocena ICF (Międzynarodowa Klasyfikacja Funkcjonowania)
              </h3>
              <p className="text-sm text-gray-600">
                Holistyczna ocena funkcjonowania pacjenta według standardów WHO
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">
                Core Set dla stanu klinicznego
              </label>
              <Select
                options={coreSetOptions}
                value={coreSetOptions.find(
                  (opt) => opt.value === selectedCoreSet
                )}
                onChange={(option) => {
                  setSelectedCoreSet(option.value);
                  loadCoreSet(option.value);
                }}
                placeholder="Wybierz Core Set..."
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="block mb-1">Data oceny</label>
              <Input
                type="date"
                value={new Date(
                  icfAssessment.assessmentDate
                ).toLocaleDateString("sv-se")}
                onChange={(e) =>
                  setICFAssessment((prev) => ({
                    ...prev,
                    assessmentDate: e.target.value,
                  }))
                }
                disabled={readOnly}
              />
            </div>
          </div>
          {summary.totalCategories > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 rounded bg-blue-50 text-center text-blue-600">
              <div>
                <div className="text-2xl font-bold">
                  {summary.totalCategories}
                </div>
                <div className="text-xs">Ocenione kategorie</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {summary.problemCategories}
                </div>
                <div className="text-xs">Znaczne problemy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {summary.barrierFactors}
                </div>
                <div className="text-xs">Bariery środowiskowe</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.facilitatorFactors}
                </div>
                <div className="text-xs">Ułatwienia</div>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      <Card className="mb-4">
        <Card.Content>
          <Input
            placeholder="Szukaj kategorii ICF po nazwie, opisie lub kodzie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={readOnly}
          />
        </Card.Content>
      </Card>

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <div className="mt-4 space-y-6">
        {activeTab === "body_functions" && (
          <CategorySection
            categoryKey="body_functions"
            icfAssessment={icfAssessment}
            updateICFItem={updateICFItem}
            addICFCategory={addICFCategory}
            removeICFCategory={removeICFCategory}
            filterCategories={filterCategories}
            searchTerm={searchTerm}
            readOnly={readOnly}
          />
        )}
        {activeTab === "body_structures" && (
          <CategorySection
            categoryKey="body_structures"
            icfAssessment={icfAssessment}
            updateICFItem={updateICFItem}
            addICFCategory={addICFCategory}
            removeICFCategory={removeICFCategory}
            filterCategories={filterCategories}
            searchTerm={searchTerm}
            readOnly={readOnly}
          />
        )}
        {activeTab === "activities_participation" && (
          <CategorySection
            categoryKey="activities_participation"
            icfAssessment={icfAssessment}
            updateICFItem={updateICFItem}
            addICFCategory={addICFCategory}
            removeICFCategory={removeICFCategory}
            filterCategories={filterCategories}
            searchTerm={searchTerm}
            readOnly={readOnly}
          />
        )}
        {activeTab === "environmental_factors" && (
          <CategorySection
            categoryKey="environmental_factors"
            icfAssessment={icfAssessment}
            updateICFItem={updateICFItem}
            addICFCategory={addICFCategory}
            removeICFCategory={removeICFCategory}
            filterCategories={filterCategories}
            searchTerm={searchTerm}
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex justify-end">
        {!readOnly && (
          <Button onClick={handleSave} disabled={!icfAssessment}>
            Zapisz ocenę ICF
          </Button>
        )}
      </div>
    </div>
  );
}
