import React, { useState, useEffect } from "react";
import { getEmployeeSchedule, updateEmployeeSchedule } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

const DAYS = [
  { value: 0, label: "Niedziela", short: "Nd" },
  { value: 1, label: "Poniedziałek", short: "Pn" },
  { value: 2, label: "Wtorek", short: "Wt" },
  { value: 3, label: "Środa", short: "Śr" },
  { value: 4, label: "Czwartek", short: "Cz" },
  { value: 5, label: "Piątek", short: "Pt" },
  { value: 6, label: "Sobota", short: "So" },
];

const HOURS = Array.from({ length: 25 }, (_, i) => ({
  value: i,
  label: i === 0 ? "Nie pracuje" : `${i.toString().padStart(2, "0")}:00`,
}));

export default function ScheduleManager({
  showScheduleModal,
  employeeId,
  onClose,
}) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [employeeName, setEmployeeName] = useState("");

  useEffect(() => {
    loadSchedule();
  }, [employeeId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const { data } = await getEmployeeSchedule(employeeId);
      setSchedule(data.data.schedule || getDefaultSchedule());
      setEmployeeName(
        `${data.data.personalInfo.firstName} ${data.data.personalInfo.lastName}`
      );
    } catch (err) {
      setError("Błąd ładowania harmonogramu");
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSchedule = () => {
    return [
      { dayOfWeek: 1, startHour: 8, endHour: 16 },
      { dayOfWeek: 2, startHour: 8, endHour: 16 },
      { dayOfWeek: 3, startHour: 8, endHour: 16 },
      { dayOfWeek: 4, startHour: 8, endHour: 16 },
      { dayOfWeek: 5, startHour: 8, endHour: 16 },
      { dayOfWeek: 6, startHour: 0, endHour: 0 },
      { dayOfWeek: 0, startHour: 0, endHour: 0 },
    ];
  };

  const updateScheduleDay = (dayOfWeek, field, value) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: parseInt(value) } : day
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const { error } = await updateEmployeeSchedule(employeeId, schedule);
      if (error) {
        setError(error);
      } else {
        onClose && onClose();
      }
    } catch (err) {
      setError("Błąd zapisywania harmonogramu");
    } finally {
      setSaving(false);
    }
  };

  const copyToAllWorkingDays = (sourceDay) => {
    const source = schedule.find((s) => s.dayOfWeek === sourceDay);
    if (!source) return;

    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek >= 1 && day.dayOfWeek <= 5 // pon-pt
          ? {
              ...day,
              startHour: source.startHour,
              endHour: source.endHour,
            }
          : day
      )
    );
  };

  const setStandardHours = (start, end) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek >= 1 && day.dayOfWeek <= 5 // pon-pt
          ? { ...day, startHour: start, endHour: end }
          : day
      )
    );
  };

  if (loading) return <div className="p-6">Ładowanie...</div>;

  return (
    <Modal
      isOpen={showScheduleModal}
      onClose={onClose}
      title={"Harmonogram pracy - " + employeeName}
      size="lg"
    >
      <>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {/* Szybkie ustawienia */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h4 className="text-sm text-gray-600 font-medium mb-3">
            Szybkie ustawienia (Pon-Pt):
          </h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStandardHours(8, 16)}
            >
              8:00-16:00
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStandardHours(9, 17)}
            >
              9:00-17:00
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStandardHours(7, 15)}
            >
              7:00-15:00
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStandardHours(10, 18)}
            >
              10:00-18:00
            </Button>
          </div>
        </div>

        {/* Harmonogram dni */}
        <div className="space-y-4 mb-6 ">
          {DAYS.map((day) => {
            const daySchedule =
              schedule.find((s) => s.dayOfWeek === day.value) || {};
            const isWorking =
              daySchedule.startHour > 0 &&
              daySchedule.endHour > daySchedule.startHour;

            return (
              <div
                key={day.value}
                className="grid grid-cols-14 gap-2 items-center p-4 border rounded"
              >
                {/* Nazwa dnia */}
                <div className="col-span-3">
                  <span className="font-medium text-gray-600">{day.short}</span>
                  <div className="text-sm text-gray-500 ">{day.label}</div>
                </div>

                {/* Godzina rozpoczęcia */}
                <div className="col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Od</label>
                  <select
                    value={daySchedule.startHour || 0}
                    onChange={(e) =>
                      updateScheduleDay(day.value, "startHour", e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-gray-400"
                  >
                    {HOURS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Godzina zakończenia */}
                <div className="col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Do</label>
                  <select
                    value={daySchedule.endHour || 0}
                    onChange={(e) =>
                      updateScheduleDay(day.value, "endHour", e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-gray-400"
                    disabled={daySchedule.startHour === 0}
                  >
                    {HOURS.slice(1).map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status i akcje */}
                <div className="col-span-2">
                  {isWorking ? (
                    <span className="text-green-600 text-sm font-medium">
                      Pracuje
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Wolny</span>
                  )}
                </div>

                {/* Przycisk kopiowania */}
                <div className="col-span-2">
                  {isWorking && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToAllWorkingDays(day.value)}
                      className="text-xs"
                    >
                      Kopiuj na Pn-Pt
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Podsumowanie */}
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h4 className="text-sm font-medium mb-2 text-gray-600">
            Podsumowanie tygodnia:
          </h4>
          <div className="text-sm text-gray-600">
            {schedule.filter((day) => day.startHour > 0).length} dni roboczych •{" "}
            {schedule
              .filter((day) => day.startHour > 0)
              .reduce(
                (total, day) => total + (day.endHour - day.startHour),
                0
              )}{" "}
            godzin łącznie
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[100px]"
          >
            {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </>
    </Modal>
  );
}
