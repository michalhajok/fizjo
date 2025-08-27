// src/components/ui/TimeSlotPicker.js
import React, { useState, useEffect } from "react";
import { getAvailableSlots } from "@/lib/api";

export default function TimeSlotPicker({
  selectedDate,
  therapistId,
  serviceId,
  duration = 45,
  onTimeSelect,
  value,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate && therapistId && serviceId) {
      loadAvailableSlots();
    }
  }, [selectedDate, therapistId, serviceId]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    const date = selectedDate.toLocaleDateString("sv-SE");
    console.log(date);

    try {
      const { data } = await getAvailableSlots(therapistId, date, duration);
      setSlots(data?.slots || []);
    } catch (error) {
      console.error("Error loading slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSlotAvailable = (time) => {
    return slots.some((slot) => slot.time === time && slot.available);
  };

  const isSlotSelected = (time) => {
    return value === time;
  };

  if (loading) {
    return (
      <div className="text-center py-4">Ładowanie dostępnych terminów...</div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Wybierz godzinę ({duration} min)
      </label>
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {slots.map((time) => {
          const available = isSlotAvailable(time.time);
          const selected = isSlotSelected(time.time);

          return (
            <button
              key={time.time}
              type="button"
              onClick={() => available && onTimeSelect(time.time)}
              disabled={!available}
              className={`
                px-3 py-2 text-sm rounded border text-center transition-colors
                ${
                  selected
                    ? "bg-blue-500 text-white border-blue-500"
                    : available
                    ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                }
              `}
            >
              {time.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
