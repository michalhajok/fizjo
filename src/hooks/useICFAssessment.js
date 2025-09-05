// Hook dla łatwego używania ICF API
import { useState, useEffect } from "react";
import { ICF_API } from "@/lib/api";

export function useICFAssessment(patientId) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        const { data, error } = await ICF_API.getPatientICFAssessments(
          patientId
        );

        if (error) {
          setError(error);
        } else {
          setAssessments(data || []);
        }
      } catch (err) {
        setError("Błąd pobierania ocen ICF");
        console.error("ICF fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [patientId]);

  const saveAssessment = async (assessmentData) => {
    try {
      setLoading(true);

      const { data, error } = assessmentData._id
        ? await ICF_API.updateICFAssessment(assessmentData._id, assessmentData)
        : await ICF_API.createICFAssessment(assessmentData);

      if (error) {
        throw new Error(error);
      }

      // Odśwież listę ocen
      const { data: updatedAssessments } =
        await ICF_API.getPatientICFAssessments(patientId);
      setAssessments(updatedAssessments || []);

      return { success: true, data };
    } catch (err) {
      console.error("Error saving ICF assessment:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (assessmentId) => {
    try {
      setLoading(true);

      const { error } = await ICF_API.deleteICFAssessment(assessmentId);

      if (error) {
        throw new Error(error);
      }

      // Usuń z lokalnego state
      setAssessments((prev) => prev.filter((a) => a._id !== assessmentId));

      return { success: true };
    } catch (err) {
      console.error("Error deleting ICF assessment:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    assessments,
    loading,
    error,
    saveAssessment,
    deleteAssessment,
    refetch: () => fetchAssessments(),
  };
}
