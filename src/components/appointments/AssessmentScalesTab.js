"use client";
import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Prosty przykład – możesz rozwinąć o Barthel, Oswestry, VAS itp.
export default function AssessmentScalesTab({ appointment, onUpdate }) {
  const [scales, setScales] = useState(
    appointment.assessmentScales || {
      vas: { painAtRest: 0, painOnMovement: 0, painWorst24h: 0 },
    }
  );

  const handleChange = (scale, field, value) => {
    setScales((prev) => ({
      ...prev,
      [scale]: {
        ...prev[scale],
        [field]: Number(value),
      },
    }));
  };

  const handleSave = () =>
    onUpdate && onUpdate({ ...appointment, assessmentScales: scales });

  return (
    <div>
      <h3 className="font-semibold">VAS – Skala bólu</h3>
      <div className="flex gap-3 flex-wrap">
        <Input
          label="Ból w spoczynku"
          type="number"
          min={0}
          max={10}
          value={scales.vas.painAtRest}
          onChange={(e) => handleChange("vas", "painAtRest", e.target.value)}
        />
        <Input
          label="Ból w ruchu"
          type="number"
          min={0}
          max={10}
          value={scales.vas.painOnMovement}
          onChange={(e) =>
            handleChange("vas", "painOnMovement", e.target.value)
          }
        />
        <Input
          label="Najgorszy ból w 24h"
          type="number"
          min={0}
          max={10}
          value={scales.vas.painWorst24h}
          onChange={(e) => handleChange("vas", "painWorst24h", e.target.value)}
        />
      </div>
      <Button type="button" className="mt-3" onClick={handleSave}>
        Zapisz
      </Button>
    </div>
  );
}
