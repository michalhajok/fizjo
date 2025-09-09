(auth)
/signin +/-
/forgot-password
/reset-password
/verify-email

/dashboard +/-
/dashboard/admin/settings -
/dashboard/documents ?
/dashboard/examinations ?

/dashboard/reports/clinical ?
/dashboard/reports/exports ?
/dashboard/profile

<!-- /dashboard/notifications
/dashboard/notifications/settings
/dashboard/notifications/templates
/dashboard/messages -->

(auth)
/signin √
/forgot-password √

/compliance

(dashboard)
/dashboard/admin/users √
/dashboard/admin/users/[id] √
/dashboard/admin/services √
/dashboard/admin/permissions √
/dashboard/admin/audit-logs √
/dashboard/admin √

/dashboard/calendar √
/dashboard/patients √
/dashboard/patients/add √
/dashboard/patients/[id]/view √
/dashboard/patients/[id]/edit √

/dashboard/appointments √
/dashboard/appointments/[id] √

/dashboard/reports √
/dashboard/reports/appointments √
/dashboard/reports/patients √
