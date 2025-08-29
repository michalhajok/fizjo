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
import Spinner from "@/components/ui/Spinner";

function CancelAppointment({
  cancelModal,
  setCancelModal,
  handleCancelAppointment,
  cancelling,
}) {
  //   const { data: services } = useApiFetch(getServices, [], true);

  //   const [form, setForm] = useState({
  //     patient: "",
  //     duration: 45, // Domyślnie 45 min
  //     scheduledTime: "", // NOWE POLE
  //     notes: "",
  //     scheduledDateTime: selectedDate.toLocaleDateString("sv-SE"), // Domyślna data
  //     service: {},
  //     physiotherapist: {},
  //   });

  //   const [formError, setFormError] = useState(null);
  //   const [submitting, setSubmitting] = useState(false);

  //   // Pobieranie pacjentów i fizjoterapeutów
  //   const { data: patientsData } = useApiFetch(getPatients, [], true);

  //   const { data: physiotherapistsData, error: physioError } = useApiFetch(
  //     getPhysiotherapists,
  //     [],
  //     true
  //   );

  //   const combineDateAndTime = (date, time) => {
  //     const [hours, minutes] = time.split(":");
  //     const combined = new Date(date);
  //     combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  //     return combined.toISOString();
  //   };

  //   const handleTimeSelect = (time) => {
  //     setForm((prev) => ({
  //       ...prev,
  //       scheduledTime: time,
  //       // Automatycznie ustaw pełną datę
  //     }));
  //   };

  //   const handleChangeService = (val) => {
  //     const s = services.find((s) => (s._id === val.value ? s.duration : ""));
  //     setForm((f) => ({
  //       ...f,
  //       service: val,
  //       duration: s.duration,
  //     }));
  //   };

  //   //   const handleCloseModal = () => {
  //   //     setIsModalOpen(false);
  //   //   };

  //   const handleFormChange = (e) => {
  //     const { name, value } = e.target;
  //     setForm((prev) => ({ ...prev, [name]: value }));
  //     setFormError(null);
  //   };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setFormError(null);

  //     // Walidacja uproszczona
  //     if (
  //       !form.patient ||
  //       !form.duration ||
  //       !form.physiotherapist ||
  //       !form.service
  //     ) {
  //       setFormError("Wszystkie pola są wymagane.");
  //       return;
  //     }

  //     setSubmitting(true);
  //     const appointmentData = {
  //       patient: form.patient.value,
  //       scheduledDateTime: combineDateAndTime(
  //         form.scheduledDateTime,
  //         form.scheduledTime
  //       ),
  //       duration: form.duration,
  //       notes: form.notes,
  //       service: form.service.value,
  //       physiotherapist: form.physiotherapist.value,
  //     };

  //     const { error } = await createAppointment(appointmentData);
  //     setSubmitting(false);
  //     if (error) {
  //       setFormError(error);
  //     } else {
  //       handleCloseModal();
  //     }
  //   };

  return (
    <Modal
      isOpen={cancelModal.open}
      onClose={() => setCancelModal({ open: false, appointment: null })}
      title="Anuluj wizytę"
    >
      <div className="space-y-4">
        {cancelModal.appointment && (
          <>
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700">
                Szczegóły wizyty:
              </h3>
              <div className="bg-gray-50 p-3 rounded-md space-y-1 text-gray-700">
                <p>
                  <strong>Pacjent:</strong>{" "}
                  {cancelModal.appointment.patient?.personalInfo?.firstName}{" "}
                  {cancelModal.appointment.patient?.personalInfo?.lastName}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(
                    cancelModal.appointment.scheduledDateTime
                  ).toLocaleString("pl-PL")}
                </p>
                <p>
                  <strong>Usługa:</strong>{" "}
                  {cancelModal.appointment.service?.name}
                </p>
                <p>
                  <strong>Fizjoterapeuta:</strong>{" "}
                  {
                    cancelModal.appointment.physiotherapist?.personalInfo
                      ?.firstName
                  }{" "}
                  {
                    cancelModal.appointment.physiotherapist?.personalInfo
                      ?.lastName
                  }
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ⚠️ Uwaga
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Anulowanie wizyty jest operacją nieodwracalną. Upewnij
                      się, że chcesz kontynuować.
                    </p>
                    <p>
                      Pacjent powinien zostać powiadomiony o anulowaniu wizyty.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() =>
                  setCancelModal({ open: false, appointment: null })
                }
                disabled={cancelling}
              >
                Nie anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {cancelling ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Anulowanie...
                  </div>
                ) : (
                  "Anuluj wizytę"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default CancelAppointment;
