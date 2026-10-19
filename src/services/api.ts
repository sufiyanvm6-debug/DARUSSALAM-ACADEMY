import {
  AuthSession,
  CMSContent,
  PeriodAttendanceSession,
  CEMarkRecord,
  ExamMarkRecord,
  GraceMarkRequest,
  LeaveRequest,
  AuditLogEntry,
  AcademicSettings,
  StudentRecord
} from '../types/academy';

const BASE_URL = '';

export async function fetchPublicCMS(): Promise<CMSContent> {
  const res = await fetch(`${BASE_URL}/api/public/content`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load CMS content');
  return data.data;
}

export async function loginUser(loginId: string, password: string, portal?: string): Promise<AuthSession> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId, password, portal })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Login failed');
  return data.session;
}

export async function changePassword(userId: string, currentPassword?: string, newPassword?: string) {
  const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, currentPassword, newPassword })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to update password');
  return data;
}

export async function changeLoginId(userId: string, newLoginId: string, currentPassword?: string) {
  const res = await fetch(`${BASE_URL}/api/auth/change-login-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newLoginId, currentPassword })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to change Login ID');
  return data;
}

export async function fetchAdminCMS() {
  const res = await fetch(`${BASE_URL}/api/admin/cms`);
  return res.json();
}

export async function saveCMSDraft(draft: CMSContent, actorName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/cms/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft, actorName })
  });
  return res.json();
}

export async function publishCMS(actorName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/cms/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorName })
  });
  return res.json();
}

export async function restoreCMSRevision(revisionId: string, actorName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/cms/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ revisionId, actorName })
  });
  return res.json();
}

export async function fetchAdminUsers() {
  const res = await fetch(`${BASE_URL}/api/admin/users`);
  return res.json();
}

export async function createAccount(payload: any) {
  const res = await fetch(`${BASE_URL}/api/admin/users/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function resetUserPassword(userId: string, newTemporaryPassword: string, actorName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newTemporaryPassword, actorName })
  });
  return res.json();
}

export async function toggleUserStatus(userId: string, actorName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/users/toggle-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, actorName })
  });
  return res.json();
}

export async function linkStudentsToParent(parentUserId: string, studentIds: string[], actorName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/users/link-students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentUserId, studentIds, actorName })
  });
  return res.json();
}

export async function fetchAcademicMeta() {
  const res = await fetch(`${BASE_URL}/api/academic/meta`);
  return res.json();
}

export async function updateAcademicSettings(settings: Partial<AcademicSettings>, actorName: string) {
  const res = await fetch(`${BASE_URL}/api/admin/academic/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings, actorName })
  });
  return res.json();
}

export async function fetchAttendance(className?: string, date?: string, period?: string) {
  const params = new URLSearchParams();
  if (className) params.append('className', className);
  if (date) params.append('date', date);
  if (period) params.append('period', period);
  const res = await fetch(`${BASE_URL}/api/attendance?${params.toString()}`);
  return res.json();
}

export async function saveAttendance(session: Partial<PeriodAttendanceSession>, actorName: string, actorId: string, actorRole: string) {
  const res = await fetch(`${BASE_URL}/api/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session, actorName, actorId, actorRole })
  });
  return res.json();
}

export async function fetchCEMarks(className?: string, subject?: string, term?: string, studentId?: string) {
  const params = new URLSearchParams();
  if (className) params.append('className', className);
  if (subject) params.append('subject', subject);
  if (term) params.append('term', term);
  if (studentId) params.append('studentId', studentId);
  const res = await fetch(`${BASE_URL}/api/ce?${params.toString()}`);
  return res.json();
}

export async function saveCEMarks(marks: CEMarkRecord | CEMarkRecord[], actorName: string, actorId: string, actorRole: string) {
  const res = await fetch(`${BASE_URL}/api/ce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marks, actorName, actorId, actorRole })
  });
  return res.json();
}

export async function fetchExamMarks(className?: string, subject?: string, term?: string, studentId?: string) {
  const params = new URLSearchParams();
  if (className) params.append('className', className);
  if (subject) params.append('subject', subject);
  if (term) params.append('term', term);
  if (studentId) params.append('studentId', studentId);
  const res = await fetch(`${BASE_URL}/api/exams?${params.toString()}`);
  return res.json();
}

export async function saveExamMarks(records: any[], actorName: string, actorId: string, actorRole: string) {
  const res = await fetch(`${BASE_URL}/api/exams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records, actorName, actorId, actorRole })
  });
  return res.json();
}

export async function fetchGraceRequests() {
  const res = await fetch(`${BASE_URL}/api/grace/list`);
  return res.json();
}

export async function requestGraceMarks(payload: any) {
  const res = await fetch(`${BASE_URL}/api/grace/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function decideGraceMarks(payload: any) {
  const res = await fetch(`${BASE_URL}/api/grace/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchLeaves(teacherId?: string) {
  const params = new URLSearchParams();
  if (teacherId) params.append('teacherId', teacherId);
  const res = await fetch(`${BASE_URL}/api/leaves?${params.toString()}`);
  return res.json();
}

export async function requestLeave(payload: any) {
  const res = await fetch(`${BASE_URL}/api/leaves/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function decideLeave(payload: any) {
  const res = await fetch(`${BASE_URL}/api/leaves/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchTimetables(className?: string) {
  const params = new URLSearchParams();
  if (className) params.append('className', className);
  const res = await fetch(`${BASE_URL}/api/timetables?${params.toString()}`);
  return res.json();
}

export async function fetchParentStudentData(studentId: string) {
  const res = await fetch(`${BASE_URL}/api/parent/student-data?studentId=${encodeURIComponent(studentId)}`);
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${BASE_URL}/api/audit-logs`);
  return res.json();
}

export async function resetSampleData() {
  const res = await fetch(`${BASE_URL}/api/admin/reset-sample-data`, { method: 'POST' });
  return res.json();
}
