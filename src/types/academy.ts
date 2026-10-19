export type UserRole = 'admin' | 'teacher' | 'parent';

export interface UserAccount {
  id: string;
  loginId: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  passwordHash: string;
  mustChangePassword: boolean;
  disabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
  teacherProfile?: {
    teacherId: string;
    designation: string;
    department: string;
    assignedClasses: string[];
    assignedSubjects: string[];
  };
  parentProfile?: {
    linkedStudentIds: string[];
    parentRelation: string;
    alternatePhone?: string;
  };
}

export interface StudentRecord {
  admissionId: string; // Permanent official ID (e.g. JM156)
  name: string;
  class: string;
  division: string;
  rollNumber: string;
  parentName: string;
  parentPhone: string;
  parentLoginId: string;
  academicYear: string;
  dateOfBirth?: string;
  address?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'medical';

export interface PeriodAttendanceItem {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface PeriodAttendanceSession {
  id: string;
  date: string; // YYYY-MM-DD
  className: string;
  period: string; // 'Period 1', 'Period 2', etc.
  subject: string;
  markedByTeacherId: string;
  markedByTeacherName: string;
  isDraft: boolean;
  records: PeriodAttendanceItem[];
  updatedAt: string;
}

export interface CEMarkRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  term: string;
  assignmentMarks: number; // max 15
  performanceMarks: number; // max 5
  totalCE: number; // max 20
  teacherRemarks?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ExamMarkRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  term: string;
  theoryMarks: number; // max 80
  ceMarks: number; // max 20
  graceMarks: number; // approved
  totalMarks: number; // max 100
  isAbsent: boolean;
  grade: string;
  status: 'Passed' | 'Failed' | 'Absent';
  teacherRemarks?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface GraceMarkRequest {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  term: string;
  currentTheoryMarks: number;
  requestedGrace: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  requestedByTeacherId: string;
  requestedByTeacherName: string;
  approvedGrace?: number;
  adminRemarks?: string;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface TimetableSlot {
  period: string;
  timeRange: string;
  subject: string;
  teacherName: string;
  room: string;
}

export interface DaySchedule {
  day: string; // 'Monday' | 'Tuesday' etc.
  slots: TimetableSlot[];
}

export interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  suggestedSubstitute?: string;
  assignedSubstitute?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminRemarks?: string;
  requestedAt: string;
  decidedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system';
  category: 'account' | 'attendance' | 'ce' | 'exam' | 'grace' | 'cms' | 'security' | 'leaves' | 'rules';
  action: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface AcademicSettings {
  medicalAttendanceRule: 'present' | 'absent' | 'excluded';
  examPublishedTerms: Record<string, boolean>; // e.g. "Annual Examination 2026-27": true
  minPassPercentage: number;
  maxGraceMarksPerStudent: number;
}

export interface CMSProgram {
  id: string;
  title: string;
  tagline: string;
  duration: string;
  eligibility: string;
  description: string;
  highlights: string[];
  imageUrl: string;
}

export interface CMSAchievement {
  id: string;
  year: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
}

export interface CMSFacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experience: string;
  photoUrl: string;
}

export interface CMSContent {
  identity: {
    academyName: string;
    subtitle: string;
    establishedYear: string;
    accreditation: string;
    motto: string;
    logoUrl?: string;
  };
  campusCover: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    badgeText: string;
    coverImageUrl: string;
    campusLocation: string;
  };
  aboutUs: {
    history: string;
    mission: string;
    vision: string;
    heritageParagraph: string;
    stats: Array<{ label: string; value: string; icon: string }>;
    facilities: string[];
  };
  contactUs: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    state: string;
    pinCode: string;
    phonePrimary: string;
    phoneSecondary: string;
    emailOfficial: string;
    emailAdmissions: string;
    workingHours: string;
    mapQuery: string;
  };
  programs: CMSProgram[];
  achievements: CMSAchievement[];
  faculty: CMSFacultyMember[];
  appearance: {
    primaryColor: string; // e.g. '#064e3b'
    accentColor: string; // e.g. '#b45309'
    fontStyle: 'scholarly' | 'modern' | 'classic';
    showPrograms: boolean;
    showAchievements: boolean;
    showFaculty: boolean;
    showAbout: boolean;
    showContact: boolean;
    showAnnouncements: boolean;
  };
  notices: Array<{
    id: string;
    title: string;
    date: string;
    category: 'Academic' | 'Admission' | 'General';
    content: string;
    isImportant: boolean;
  }>;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    loginId: string;
    name: string;
    role: UserRole;
    email?: string;
    phone?: string;
    mustChangePassword: boolean;
    teacherProfile?: UserAccount['teacherProfile'];
    parentProfile?: UserAccount['parentProfile'];
  };
}
