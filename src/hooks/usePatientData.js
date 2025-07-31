// src/hooks/usePatientData.js
import { useState, useCallback, useEffect } from "react";
import useFetch from "./useFetch";
import useLocalStorage from "./useLocalStorage";

const usePatientData = (patientId = null) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    therapyType: "all",
    dateRange: "all",
  });

  const [recentPatients, setRecentPatients] = useLocalStorage(
    "recentPatients",
    []
  );

  // Fetch patients list
  const {
    data: patients,
    loading: loadingPatients,
    error: patientsError,
    refetch: refetchPatients,
  } = useFetch("/api/patients", {
    immediate: true,
    transform: (data) => data.patients || data,
  });

  // Fetch specific patient data
  const {
    data: patientDetails,
    loading: loadingPatient,
    error: patientError,
    execute: fetchPatient,
  } = useFetch(patientId ? `/api/patients/${patientId}` : null, {
    immediate: !!patientId,
    transform: (data) => data.patient || data,
  });

  // Patient operations
  const createPatient = useCallback(
    async (patientData) => {
      try {
        const response = await fetch("/api/patients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("token") || sessionStorage.getItem("token")
            }`,
          },
          body: JSON.stringify(patientData),
        });

        if (!response.ok) {
          throw new Error("Błąd podczas tworzenia pacjenta");
        }

        const result = await response.json();
        await refetchPatients();

        return { success: true, patient: result.patient };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [refetchPatients]
  );

  const updatePatient = useCallback(
    async (id, patientData) => {
      try {
        const response = await fetch(`/api/patients/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("token") || sessionStorage.getItem("token")
            }`,
          },
          body: JSON.stringify(patientData),
        });

        if (!response.ok) {
          throw new Error("Błąd podczas aktualizacji pacjenta");
        }

        const result = await response.json();
        await refetchPatients();

        if (selectedPatient?.id === id) {
          setSelectedPatient(result.patient);
        }

        return { success: true, patient: result.patient };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [refetchPatients, selectedPatient]
  );

  const deletePatient = useCallback(
    async (id) => {
      try {
        const response = await fetch(`/api/patients/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("token") || sessionStorage.getItem("token")
            }`,
          },
        });

        if (!response.ok) {
          throw new Error("Błąd podczas usuwania pacjenta");
        }

        await refetchPatients();

        if (selectedPatient?.id === id) {
          setSelectedPatient(null);
        }

        // Remove from recent patients
        setRecentPatients((prev) => prev.filter((p) => p.id !== id));

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [refetchPatients, selectedPatient, setRecentPatients]
  );

  // Patient selection
  const selectPatient = useCallback(
    async (id) => {
      if (!id) {
        setSelectedPatient(null);
        return;
      }

      try {
        const patient = await fetchPatient(`/api/patients/${id}`);
        setSelectedPatient(patient);

        // Add to recent patients
        setRecentPatients((prev) => {
          const filtered = prev.filter((p) => p.id !== id);
          const updated = [
            {
              id: patient.id,
              name: `${patient.firstName} ${patient.lastName}`,
              avatar: patient.avatar,
            },
            ...filtered,
          ].slice(0, 10); // Keep only 10 recent patients

          return updated;
        });

        return patient;
      } catch (error) {
        console.error("Błąd podczas pobierania danych pacjenta:", error);
        return null;
      }
    },
    [fetchPatient, setRecentPatients]
  );

  // Search and filter
  const filteredPatients = useCallback(() => {
    if (!patients) return [];

    return patients.filter((patient) => {
      const matchesSearch =
        searchTerm === "" ||
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm);

      const matchesStatus =
        filters.status === "all" || patient.status === filters.status;

      const matchesTherapyType =
        filters.therapyType === "all" ||
        patient.therapyType === filters.therapyType;

      return matchesSearch && matchesStatus && matchesTherapyType;
    });
  }, [patients, searchTerm, filters]);

  // Patient statistics
  const getPatientStats = useCallback(() => {
    if (!patients) return null;

    const total = patients.length;
    const active = patients.filter((p) => p.status === "active").length;
    const completed = patients.filter((p) => p.status === "completed").length;
    const pending = patients.filter((p) => p.status === "pending").length;

    return {
      total,
      active,
      completed,
      pending,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [patients]);

  // Appointments for selected patient
  const {
    data: patientAppointments,
    loading: loadingAppointments,
    refetch: refetchAppointments,
  } = useFetch(
    selectedPatient ? `/api/patients/${selectedPatient.id}/appointments` : null,
    {
      immediate: !!selectedPatient,
      transform: (data) => data.appointments || data,
    }
  );

  // Medical history for selected patient
  const {
    data: medicalHistory,
    loading: loadingHistory,
    refetch: refetchHistory,
  } = useFetch(
    selectedPatient ? `/api/patients/${selectedPatient.id}/history` : null,
    {
      immediate: !!selectedPatient,
      transform: (data) => data.history || data,
    }
  );

  // Auto-select patient on mount if patientId provided
  useEffect(() => {
    if (patientId && !selectedPatient) {
      selectPatient(patientId);
    }
  }, [patientId, selectedPatient, selectPatient]);

  return {
    // Data
    patients: filteredPatients(),
    selectedPatient: selectedPatient || patientDetails,
    patientAppointments,
    medicalHistory,
    recentPatients,

    // Loading states
    loadingPatients,
    loadingPatient,
    loadingAppointments,
    loadingHistory,

    // Errors
    patientsError,
    patientError,

    // Operations
    createPatient,
    updatePatient,
    deletePatient,
    selectPatient,
    refetchPatients,
    refetchAppointments,
    refetchHistory,

    // Search and filters
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,

    // Utilities
    getPatientStats,
  };
};

export default usePatientData;
