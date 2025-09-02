"use client";

import { useState } from "react";
import useApiFetch from "@/hooks/useApiFetch";
import {
  createAppointment,
  getPatients,
  getServices,
  getPhysiotherapists,
} from "@/lib/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TimeSlotPicker from "@/components/ui/TimeSlotPicker";

function AddAppointment({ isModalOpen, handleCloseModal, selectedDate }) {
  const { data: services } = useApiFetch(getServices, [], true);

  const [form, setForm] = useState({
    patient: "",
    duration: 45, // Domyślnie 45 min
    scheduledTime: "", // NOWE POLE
    notes: "",
    scheduledDateTime: selectedDate.toLocaleDateString("sv-SE"), // Domyślna data
    service: {},
    physiotherapist: {},
  });

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pobieranie pacjentów i fizjoterapeutów
  const { data: patientsData } = useApiFetch(getPatients, [], true);

  const { data: physiotherapistsData, error: physioError } = useApiFetch(
    getPhysiotherapists,
    [],
    true
  );

  const combineDateAndTime = (date, time) => {
    const [hours, minutes] = time.split(":");
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString();
  };

  const handleTimeSelect = (time) => {
    setForm((prev) => ({
      ...prev,
      scheduledTime: time,
    }));
  };

  const handleChangeService = (val) => {
    const s = services.find((s) => (s._id === val.value ? s.duration : ""));
    setForm((f) => ({
      ...f,
      service: val,
      duration: s.duration,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Walidacja uproszczona
    if (
      !form.patient ||
      !form.duration ||
      !form.physiotherapist ||
      !form.service
    ) {
      setFormError("Wszystkie pola są wymagane.");
      return;
    }

    setSubmitting(true);
    const appointmentData = {
      patient: form.patient.value,
      scheduledDateTime: combineDateAndTime(
        form.scheduledDateTime,
        form.scheduledTime
      ),
      duration: form.duration,
      notes: form.notes,
      service: form.service.value,
      physiotherapist: form.physiotherapist.value,
    };

    const { error } = await createAppointment(appointmentData);
    setSubmitting(false);
    if (error) {
      setFormError(error);
    } else {
      handleCloseModal();
    }
  };

  return (
    <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Nowa wizyta">
      <form className="space-y-4">
        <Select
          label="Pacjent"
          name="patient"
          options={patientsData?.data.map((p) => ({
            value: p._id,
            label: `${p.personalInfo.firstName} ${p.personalInfo.lastName}`,
          }))}
          value={form.patient}
          searchable
          onChange={(val) =>
            setForm((f) => ({
              ...f,
              patient: val,
            }))
          }
          required
        />
        <Select
          label="Fizjoterapeuta"
          name="physiotherapist"
          options={physiotherapistsData?.data.map((u) => ({
            value: u._id,
            label: `${u.personalInfo.firstName} ${u.personalInfo.lastName}`,
          }))}
          value={form.physiotherapist}
          onChange={(val) => setForm((f) => ({ ...f, physiotherapist: val }))}
          required
        />
        <Select
          label="Usługa"
          name="service"
          options={services?.map((s) => ({ value: s._id, label: s.name }))}
          value={form.service}
          onChange={(val) => handleChangeService(val)}
          required
        />
        <Input
          label="Data"
          name="scheduledDateTime"
          type="date"
          value={form.scheduledDateTime}
          onChange={handleFormChange}
          required
        />
        {form.physiotherapist && (
          <TimeSlotPicker
            selectedDate={new Date(form.scheduledDateTime)}
            therapistId={form.physiotherapist.value}
            serviceId={form.service.value}
            duration={form.duration}
            value={form.scheduledTime}
            onTimeSelect={handleTimeSelect}
          />
        )}
        <Input
          label="Notatki"
          name="notes"
          as="textarea"
          value={form.notes}
          onChange={handleFormChange}
          rows={3}
        />
        <div className="flex justify-end gap-4">
          <Button onClick={handleSubmit}>Dodaj wizytę</Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddAppointment;
