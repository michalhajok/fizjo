async function request(
  url,
  { method = "GET", body, headers = {}, skipRefresh = false } = {}
) {
  let accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken")
      : null;

  let refreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("refreshToken") ||
        sessionStorage.getItem("refreshToken")
      : null;

  // Funkcja wykonująca fetch z aktualnym accessTokenem
  async function doFetch(currentAccessToken) {
    const res = await fetch(`${process.env.BACKEND_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(currentAccessToken
          ? { Authorization: `Bearer ${currentAccessToken}` }
          : {}),
        ...headers,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });

    const status = res.status;
    let data = null;
    let error = null;

    try {
      data = await res.json();
      if (!res.ok) {
        error = data.message || `HTTP ${status}`;
        data = null;
      }
    } catch {
      if (!res.ok) {
        error = `HTTP ${status}`;
      }
    }

    return { data, error, status, res };
  }

  // 1. Spróbuj normalnie
  let { data, error, status, res } = await doFetch(accessToken);

  // 2. Jeśli accessToken wygasł i mamy refreshToken, spróbuj odświeżyć (chyba że skipRefresh)
  if (
    status === 401 &&
    !skipRefresh &&
    refreshToken &&
    typeof window !== "undefined"
  ) {
    const refreshResponse = await fetch(
      `${process.env.BACKEND_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      // Zapisz nowe tokeny
      localStorage.setItem("accessToken", refreshData.accessToken);
      if (refreshData.refreshToken) {
        localStorage.setItem("refreshToken", refreshData.refreshToken);
      }
      // Spróbuj ponownie z nowym accessTokenem, już bez kolejnego odświeżania
      return await request(url, {
        method,
        body,
        headers,
        skipRefresh: true,
      });
    } else {
      // Refresh nieudany, usuń tokeny
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      error = "Sesja wygasła. Zaloguj się ponownie.";
      data = null;
    }
  }

  return { data, error, status };
}

// AUTH
export const signIn = async (body) => {
  const result = await request("/api/auth/login", { method: "POST", body });

  if (result.data.data && result.data.data.tokens) {
    localStorage.setItem("accessToken", result.data.data.tokens.accessToken);
    localStorage.setItem("user", JSON.stringify(result.data.data.user));
    if (result.data.refreshToken) {
      localStorage.setItem(
        "refreshToken",
        result.data.data.tokens.refreshToken
      );
    }
    return {
      data: result.data.data,
      error: null,
    };
  }
};

export const signUp = (body) =>
  request("/api/auth/signup", { method: "POST", body });

export const logOut = async () => {
  // Wyloguj na backendzie i usuń tokeny lokalnie
  await request("/api/auth/logout", { method: "POST" });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const updateProfile = (body) =>
  request("/api/auth/profile", { method: "PUT", body });

export const verifyToken = async () => {
  const result = await request("/api/auth/verify");

  return result;
};

export const forgotPassword = (email) =>
  request("/api/auth/forgot-password", { method: "POST", body: { email } });

export const resetPassword = (token, password) =>
  request("/api/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });

export const validateResetToken = (token) =>
  request("/api/auth/validate-reset-token", {
    method: "POST",
    body: { token },
  });

export const verifyEmail = (token) =>
  request("/api/auth/verify-email", { method: "POST", body: { token } });

export const resendVerification = () =>
  request("/api/auth/resend-verification", { method: "POST" });

// PATIENTS
export const getPatients = () => request("/api/patients");

export const createPatient = (body) =>
  request("/api/patients", { method: "POST", body });

export const getPatient = (id) => request(`/api/patients/${id}`);

export const updatePatient = (id, body) =>
  request(`/api/patients/${id}`, { method: "PUT", body });

export const deletePatient = (id) =>
  request(`/api/patients/${id}`, { method: "DELETE" });

export const getPatientHistory = (id) => request(`/api/patients/${id}/history`);

export const getPhysiotherapists = () =>
  request("/api/employees/type/physiotherapist");

// APPOINTMENTS
export const getAppointments = () => request("/api/appointments");

export const getTodayAppointments = () => request("/api/appointments/today");

export const getAppointment = (id) =>
  request(`/api/appointments/${id}`, { method: "GET" });

export const getPatientAppointments = (id) =>
  request(`/api/appointments/patient/${id}`);

export const createAppointment = (body) =>
  request("/api/appointments", { method: "POST", body });

export const updateAppointment = (id, body) =>
  request(`/api/appointments/${id}`, { method: "PUT", body });

export const updateAppointmentStatus = (id, status) =>
  request(`/api/appointments/${id}/status`, {
    method: "PUT",
    body: { status },
  });
export const updateSoapNotes = (id, body) =>
  request(`/api/appointments/${id}/soap-notes`, {
    method: "PUT",
    body,
  });
export const signAppointment = (id) =>
  request(`/api/appointments/${id}/sign`, { method: "POST" });
export const getTemplates = () =>
  request("/api/appointments/templates", { method: "GET" });
export const applyTemplate = (id, body) =>
  request(`/api/appointments/${id}/apply-template`, {
    method: "POST",
    body,
  });

export const getAvailableSlots = (therapistId, date, duration) => {
  return request(
    `/api/appointments/slots?therapist=${therapistId}&date=${date}&duration=${duration}`
  );
};

export const getTherapistSchedule = (therapistId, date) => {
  const dateStr = date.toISOString().split("T");
  return request(`/api/therapists/${therapistId}/schedule?date=${dateStr}`);
};

export const deleteAppointment = (id) =>
  request(`/api/appointments/${id}`, { method: "DELETE" });

export const getAuditLogsForAppointment = (appointmentId) =>
  request(`/api/appointments/${appointmentId}/audit-logs`, { method: "GET" });

export const uploadAttachment = async (appointmentId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${
      `${process.env.BACKEND_URL}` || ""
    }/api/appointments/${appointmentId}/attachments`,
    {
      method: "POST",
      body: formData,
      headers: {
        // Nie ustawiaj Content-Type przy FormData!
        Authorization: localStorage.getItem("accessToken")
          ? `Bearer ${localStorage.getItem("accessToken")}`
          : undefined,
      },
      credentials: "include",
    }
  );
  if (!res.ok) {
    return { success: false, error: "Błąd uploadu" };
  }
  const data = await res.json();
  return data;
};

export const deleteAttachment = (appointmentId, attachmentId) =>
  request(`/api/appointments/${appointmentId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });

// export const getIcd9Procedures = (search = "") =>
//   request(`/api/icd9${search ? "?search=" + encodeURIComponent(search) : ""}`, {
//     method: "GET",
//   });

export const getIcd9Procedures = () => request(`/api/icd9`);

// STATS
export const getWeeklyStats = () => request("/api/stats/weekly");

// ADMIN
export const createUser = (body) =>
  request("/api/admin/users", { method: "POST", body });

export const getUsers = async () => {
  const result = await request("/api/admin/users");

  return result.data;
};

export const getGlobalSettings = () =>
  request("/api/admin/settings", { method: "GET" });

export const updateGlobalSettings = (body) =>
  request("/api/admin/settings/global", { method: "PUT", body });

export const getServices = () => request("/api/services", { method: "GET" });

export const createService = (body) =>
  request("/api/services", { method: "POST", body });

export const updateService = (id, body) =>
  request(`/api/services/${id}`, { method: "PUT", body });

export const getPermissions = () =>
  request("/api/admin/permissions", { method: "GET" });

export const CreatePermission = (body) =>
  request("/api/admin/permissions", { method: "POST", body });

export const updatePermissions = (id, body) =>
  request("/api/admin/permissions", { method: "PUT", body });

export const updateUserRole = (id, role) =>
  request(`/api/admin/users/${id}/role`, {
    method: "PUT",
    body: { role },
  });

export const updateUserPermissions = (id, permissions) =>
  request(`/api/admin/users/${id}/permissions`, {
    method: "PUT",
    body: { permissions },
  });

export const getAuditLogs = () =>
  request("/api/admin/audit-logs", { method: "GET" });

export const generateResetLink = (userId) => {
  console.log("Generating reset link for user:", userId);

  return request(`/api/admin/users/${userId}/generate-reset-link`, {
    method: "POST",
  });
};

export const sendResetEmail = (userId, options = {}) =>
  request(`/api/admin/users/${userId}/send-reset-email`, {
    method: "POST",
    body: options, // { customMessage?: string, expiresIn?: string }
  });

// Pobierz dane pojedynczego użytkownika (GET /api/users/:id)
export const getUser = (id) => request(`/api/admin/users/${id}`);

// Zaktualizuj dane użytkownika (PUT /api/users/:id)
export const updateUser = (id, body) =>
  request(`/api/users/${id}`, { method: "PUT", body });

export const getEmployee = (id) => request(`/api/employees/${id}`);
export const updateEmployee = (id, body) =>
  request(`/api/employees/${id}`, { method: "PUT", body });

export const getEmployeeSchedule = (id) =>
  request(`/api/employees/${id}/schedule`);

export const updateEmployeeSchedule = (id, schedule) =>
  request(`/api/employees/${id}/schedule`, {
    method: "PUT",
    body: { schedule },
  });

export const withErrorHandling = (apiFunction) => {
  return async (...args) => {
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (error) {
      console.error(`API Error in ${apiFunction.name}:`, error);

      // Log to external service in production
      if (process.env.NODE_ENV === "production") {
        // Sentry.captureException(error);
      }

      return {
        data: null,
        error: "Wystąpił błąd połączenia. Spróbuj ponownie.",
        status: 500,
      };
    }
  };
};
