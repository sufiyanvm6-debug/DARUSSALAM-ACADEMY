import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  UserAccount,
  StudentRecord,
  PeriodAttendanceSession,
  CEMarkRecord,
  ExamMarkRecord,
  GraceMarkRequest,
  LeaveRequest,
  AuditLogEntry,
  AcademicSettings,
  CMSContent
} from './src/types/academy';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'academy-store.json');

app.use(express.json({ limit: '15mb' }));

// Secure Password Hashing Helper
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 1000, 32, 'sha256').toString('hex');
  return { hash, salt: s };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
  return computed === hash;
}

// Initial Database Structure
interface AcademyDatabase {
  users: Array<UserAccount & { salt: string }>;
  students: StudentRecord[];
  attendance: PeriodAttendanceSession[];
  ceMarks: CEMarkRecord[];
  examMarks: ExamMarkRecord[];
  graceRequests: GraceMarkRequest[];
  leaveRequests: LeaveRequest[];
  auditLogs: AuditLogEntry[];
  academicSettings: AcademicSettings;
  cmsDraft: CMSContent;
  cmsPublished: CMSContent;
  cmsRevisions: Array<{ id: string; timestamp: string; publishedBy: string; content: CMSContent }>;
}

const defaultCMS: CMSContent = {
  identity: {
    academyName: "Darussalam Academy",
    subtitle: "Nandi, Kozhikode, Kerala",
    establishedYear: "1998",
    accreditation: "Recognized Educational & Islamic Studies Institute",
    motto: "Knowledge, Character, & Spiritual Excellence",
    logoUrl: ""
  },
  campusCover: {
    heroTitle: "Nurturing Islamic Scholarship & Modern Academic Brilliance",
    heroSubtitle: "A serene coastal campus in Nandi, Kerala dedicated to producing ethical leaders, scholars, and professionals.",
    heroDescription: "Darussalam Academy harmoniously unites classical Islamic disciplines, Hifz-ul-Quran, and modern school education in a disciplined, uplifting environment.",
    badgeText: "Admissions Open for Academic Year 2026–27",
    coverImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
    campusLocation: "Nandi Beach Road, Kozhikode District, Kerala"
  },
  aboutUs: {
    history: "Founded in 1998 under the visionary leadership of distinguished Kerala Islamic scholars, Darussalam Academy has stood as a beacon of moral and educational reformation on the serene Malabar coast.",
    mission: "To cultivate righteous individuals grounded in sound Islamic theology, intellectual curiosity, high academic competence, and civic responsibility.",
    vision: "To be a premier center of integrated learning where tradition and modernity inspire visionary community leadership.",
    heritageParagraph: "Situated in Nandi, Kozhikode, surrounded by breezy palm canopies and the Arabian sea breeze, our campus offers a distraction-free, spiritually elevating atmosphere where students memorize the Holy Quran, master Arabic and jurisprudence, and excel in modern sciences.",
    stats: [
      { label: "Students Enrolled", value: "850+", icon: "Users" },
      { label: "Faculty Scholars", value: "48", icon: "GraduationCap" },
      { label: "Board Pass Rate", value: "100%", icon: "Award" },
      { label: "Years of Heritage", value: "28+", icon: "Clock" }
    ],
    facilities: [
      "Grand Central Juma Masjid & Prayer Halls",
      "Specialized Hifz-ul-Quran Sanctuary",
      "Digital Smart Classrooms & High-Speed Labs",
      "Extensive Islamic & Modern Research Library",
      "Well-equipped Physics, Chemistry & Biology Labs",
      "Clean Boarding Hostels & Hygienic Malabar Mess"
    ]
  },
  contactUs: {
    addressLine1: "Darussalam Academy Campus, Nandi P.O.",
    addressLine2: "Near Nandi Railway Station, Koyilandy Taluk",
    city: "Kozhikode",
    district: "Kozhikode District",
    state: "Kerala",
    pinCode: "673305",
    phonePrimary: "+91 496 269 1100",
    phoneSecondary: "+91 98470 54321",
    emailOfficial: "info@darussalamnandi.edu.in",
    emailAdmissions: "admissions@darussalamnandi.edu.in",
    workingHours: "Saturday – Thursday: 8:00 AM – 4:30 PM (Friday Closed)",
    mapQuery: "Nandi, Kozhikode, Kerala"
  },
  programs: [
    {
      id: "prog-1",
      title: "Da'wa & Shari'ah Integrated Degree",
      tagline: "Comprehensive 6-Year Course",
      duration: "6 Years (Post-10th)",
      eligibility: "SSLC / 10th Standard with Arabic aptitude",
      description: "An intensive curriculum weaving classical Usul al-Fiqh, Hadith studies, Arabic rhetoric, and modern bachelor degree programs.",
      highlights: ["Classical Islamic Jurisprudence", "Comparative Religion", "B.A./B.Com Integration", "Public Speaking & Dawah"],
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "prog-2",
      title: "Hifz-ul-Quran with Regular Schooling",
      tagline: "Sacred Memorization & Formal Academics",
      duration: "3–4 Years",
      eligibility: "Completed 4th or 5th Standard",
      description: "Carefully calibrated Tajweed and daily Quranic memorization alongside state curriculum mathematics, science, English, and Malayalam.",
      highlights: ["Individualized Sanad Guidance", "Tajweed & Voice Modulation", "Continuous Evaluation", "Standard School Syllabus"],
      imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "prog-3",
      title: "Senior Secondary (Kerala State / NIOS)",
      tagline: "Science, Commerce & Humanities",
      duration: "2 Years (+1 & +2)",
      eligibility: "10th Standard Pass",
      description: "Rigorous academic coaching for board examinations coupled with moral ethics, personality development, and competitive entrance coaching.",
      highlights: ["Modern Science Laboratories", "NEET / KEAM / CUET Guidance", "Islamic Moral Studies", "Communication Skills"],
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "prog-4",
      title: "Primary & Upper Primary Wing",
      tagline: "Class 01 to Class 07",
      duration: "Foundational Years",
      eligibility: "Age 6+ for Class 01",
      description: "Holistic child development fostering Islamic manners (Adab), fluent reading of Arabic & English, mental math, and experiential curiosity.",
      highlights: ["Activity-based Learning", "Moral Education & Supplications", "Clean Campus Care", "Personal Attention"],
      imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
    }
  ],
  achievements: [
    {
      id: "ach-1",
      year: "2026",
      title: "100% Distinction in Islamic Board Examinations",
      category: "Academic Excellence",
      description: "All candidates secured first-class honors with state-level ranks in Arabic and Islamic Jurisprudence.",
      imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "ach-2",
      year: "2025",
      title: "Kerala State All-Schools Arabic Fest Winners",
      category: "Cultural & Literary",
      description: "First prize in Arabic Eloquence, Quran Recitation (Qira'at), and Islamic Calligraphy exhibitions.",
      imageUrl: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "ach-3",
      year: "2025",
      title: "State Green Campus & Eco-Architecture Award",
      category: "Institution Award",
      description: "Recognized by Kozhikode District Environmental Forum for sustainable rainwater harvesting and solar adoption.",
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80"
    }
  ],
  faculty: [
    {
      id: "fac-1",
      name: "Usthad Ibrahim Faizy",
      designation: "Dean of Islamic Studies & Senior Teacher",
      department: "Islamic Jurisprudence & Hadith",
      qualification: "M.A. Islamic Studies, Faizy Sanad",
      experience: "19 Years",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "fac-2",
      name: "Usthad Kabeer Nandi",
      designation: "Head of Dept — Quran & Hifz Wing",
      department: "Quranic Sciences & Tajweed",
      qualification: "Hafiz-ul-Quran, Qari (Egypt Certified)",
      experience: "14 Years",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "fac-3",
      name: "Prof. Abdul Rahman M.Sc",
      designation: "Head of General Sciences",
      department: "Mathematics & Sciences",
      qualification: "M.Sc Mathematics, B.Ed",
      experience: "16 Years",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "fac-4",
      name: "Usthad Dr. Ashraf Ali",
      designation: "Vice Principal & Academic Coordinator",
      department: "Arabic Literature & Languages",
      qualification: "Ph.D. in Arabic Literature, Calicut University",
      experience: "21 Years",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    }
  ],
  appearance: {
    primaryColor: "#064e3b", // Deep emerald
    accentColor: "#b45309", // Warm brass/amber
    fontStyle: "scholarly",
    showPrograms: true,
    showAchievements: true,
    showFaculty: true,
    showAbout: true,
    showContact: true,
    showAnnouncements: true
  },
  notices: [
    {
      id: "not-1",
      title: "Registration for Academic Year 2026–27 Entrance Test",
      date: "October 15, 2026",
      category: "Admission",
      content: "Entrance evaluations for Da'wa and Hifz courses commence next month. Prospectus available at office.",
      isImportant: true
    },
    {
      id: "not-2",
      title: "Mid-Term Academic Progress Reports Published",
      date: "October 12, 2026",
      category: "Academic",
      content: "Parents can log in to the Parent Portal to review their child's approved evaluation cards and attendance status.",
      isImportant: false
    },
    {
      id: "not-3",
      title: "Annual Quran & Seerah Competitions 2026",
      date: "November 04, 2026",
      category: "General",
      content: "Inter-class competitions will take place at Darussalam Main Auditorium. Program schedule posted on notice boards.",
      isImportant: false
    }
  ]
};

// Seed initial database
function initializeDatabase(): AcademyDatabase {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      return data;
    } catch (e) {
      console.error('Error reading data file, reinitializing', e);
    }
  }

  const { hash: adminHash, salt: adminSalt } = hashPassword('admin123');
  const { hash: teacherHash, salt: teacherSalt } = hashPassword('teacher123');
  const { hash: parentHash, salt: parentSalt } = hashPassword('parent123');

  const users: Array<UserAccount & { salt: string }> = [
    {
      id: 'usr-admin',
      loginId: 'admin',
      name: 'Academy Administrator',
      role: 'admin',
      email: 'admin@darussalamnandi.edu.in',
      phone: '+91 98470 54321',
      passwordHash: adminHash,
      salt: adminSalt,
      mustChangePassword: false,
      disabled: false,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr-teacher-1',
      loginId: 'teacher_faizy',
      name: 'Usthad Ibrahim Faizy',
      role: 'teacher',
      email: 'faizy@darussalamnandi.edu.in',
      phone: '+91 98471 11223',
      passwordHash: teacherHash,
      salt: teacherSalt,
      mustChangePassword: false,
      disabled: false,
      createdAt: '2026-01-10T00:00:00.000Z',
      teacherProfile: {
        teacherId: 'TCH-01',
        designation: 'Senior Faculty & Class In-charge',
        department: 'Islamic Studies & Arabic',
        assignedClasses: ['Class 02', 'Class 03'],
        assignedSubjects: ['Arabic Language', 'Islamic Jurisprudence (Fiqh)', 'Moral Studies']
      }
    },
    {
      id: 'usr-teacher-2',
      loginId: 'teacher_kabeer',
      name: 'Usthad Kabeer Nandi',
      role: 'teacher',
      email: 'kabeer@darussalamnandi.edu.in',
      phone: '+91 98471 44556',
      passwordHash: teacherHash,
      salt: teacherSalt,
      mustChangePassword: false,
      disabled: false,
      createdAt: '2026-01-12T00:00:00.000Z',
      teacherProfile: {
        teacherId: 'TCH-02',
        designation: 'Quran & Tajweed Faculty',
        department: 'Quranic Sciences',
        assignedClasses: ['Class 02', 'Class 04'],
        assignedSubjects: ['Quran Recitation & Hifz', 'Tajweed']
      }
    },
    {
      id: 'usr-teacher-3',
      loginId: 'teacher_rahman',
      name: 'Prof. Abdul Rahman M.Sc',
      role: 'teacher',
      email: 'rahman@darussalamnandi.edu.in',
      phone: '+91 98471 77889',
      passwordHash: teacherHash,
      salt: teacherSalt,
      mustChangePassword: false,
      disabled: false,
      createdAt: '2026-01-15T00:00:00.000Z',
      teacherProfile: {
        teacherId: 'TCH-03',
        designation: 'General Science Teacher',
        department: 'Mathematics & Science',
        assignedClasses: ['Class 02', 'Class 05'],
        assignedSubjects: ['Mathematics', 'Environmental Science', 'English']
      }
    },
    // Parent accounts for the Class 02 students
    {
      id: 'usr-parent-1',
      loginId: 'parent_jm156',
      name: 'Chekku Haji (Parent of Abdul Hadi)',
      role: 'parent',
      phone: '+91 98471 23210',
      email: 'chekku.haji@gmail.com',
      passwordHash: parentHash,
      salt: parentSalt,
      mustChangePassword: false,
      disabled: false,
      createdAt: '2026-02-01T00:00:00.000Z',
      parentProfile: {
        linkedStudentIds: ['JM156'],
        parentRelation: 'Father'
      }
    },
    {
      id: 'usr-parent-2',
      loginId: 'parent_jm157',
      name: 'Twaha Musliyar (Parent of Abdullah Amal)',
      role: 'parent',
      phone: '+91 98471 23211',
      passwordHash: parentHash,
      salt: parentSalt,
      mustChangePassword: false,
      disabled: false,
      createdAt: '2026-02-01T00:00:00.000Z',
      parentProfile: {
        linkedStudentIds: ['JM157'],
        parentRelation: 'Father'
      }
    },
    {
      id: 'usr-parent-3',
      loginId: 'parent_jm163',
      name: 'Zaman K.P. (Parent of Azhar Zaman)',
      role: 'parent',
      phone: '+91 98471 23212',
      passwordHash: parentHash,
      salt: parentSalt,
      mustChangePassword: false,
      disabled: false,
      createdAt: '2026-02-01T00:00:00.000Z',
      parentProfile: {
        linkedStudentIds: ['JM163'],
        parentRelation: 'Father'
      }
    }
  ];

  const students: StudentRecord[] = [
    {
      admissionId: 'JM156',
      name: 'Abdul Hadi C',
      class: 'Class 02',
      division: 'A',
      rollNumber: '01',
      parentName: 'Chekku Haji',
      parentPhone: '+91 98471 23210',
      parentLoginId: 'parent_jm156',
      academicYear: '2026–27',
      dateOfBirth: '2019-04-14',
      address: 'Chaliyam Road, Nandi P.O.'
    },
    {
      admissionId: 'JM157',
      name: 'Abdullah Amal Twaha',
      class: 'Class 02',
      division: 'A',
      rollNumber: '02',
      parentName: 'Twaha Musliyar',
      parentPhone: '+91 98471 23211',
      parentLoginId: 'parent_jm157',
      academicYear: '2026–27',
      dateOfBirth: '2019-06-20',
      address: 'Kappad Coastal Avenue, Calicut'
    },
    {
      admissionId: 'JM163',
      name: 'Azhar Zaman',
      class: 'Class 02',
      division: 'A',
      rollNumber: '03',
      parentName: 'Zaman K.P.',
      parentPhone: '+91 98471 23212',
      parentLoginId: 'parent_jm163',
      academicYear: '2026–27',
      dateOfBirth: '2019-02-11',
      address: 'Nandi Railway Gate, Nandi'
    },
    {
      admissionId: 'JM165',
      name: 'Muhammed',
      class: 'Class 02',
      division: 'A',
      rollNumber: '04',
      parentName: 'Musthafa V.P.',
      parentPhone: '+91 98471 23213',
      parentLoginId: 'parent_jm165',
      academicYear: '2026–27',
      dateOfBirth: '2019-08-05',
      address: 'Koyilandy Main Road'
    },
    {
      admissionId: 'JM168',
      name: 'Muhammed Fadil MT',
      class: 'Class 02',
      division: 'A',
      rollNumber: '05',
      parentName: 'Tahir M.T.',
      parentPhone: '+91 98471 23214',
      parentLoginId: 'parent_jm168',
      academicYear: '2026–27',
      dateOfBirth: '2019-05-29',
      address: 'Thikkodi Beach, Kozhikode'
    },
    {
      admissionId: 'JM169',
      name: 'Muhammed Falah K',
      class: 'Class 02',
      division: 'A',
      rollNumber: '06',
      parentName: 'Kareem K.',
      parentPhone: '+91 98471 23215',
      parentLoginId: 'parent_jm169',
      academicYear: '2026–27',
      dateOfBirth: '2019-09-17',
      address: 'Nandi Bazaar South'
    }
  ];

  // Pre-seed attendance for Class 02
  const attendance: PeriodAttendanceSession[] = [
    {
      id: 'att-1',
      date: '2026-10-18',
      className: 'Class 02',
      period: 'Period 1',
      subject: 'Arabic Language',
      markedByTeacherId: 'usr-teacher-1',
      markedByTeacherName: 'Usthad Ibrahim Faizy',
      isDraft: false,
      updatedAt: '2026-10-18T08:45:00.000Z',
      records: [
        { studentId: 'JM156', studentName: 'Abdul Hadi C', status: 'present' },
        { studentId: 'JM157', studentName: 'Abdullah Amal Twaha', status: 'present' },
        { studentId: 'JM163', studentName: 'Azhar Zaman', status: 'present' },
        { studentId: 'JM165', studentName: 'Muhammed', status: 'present' },
        { studentId: 'JM168', studentName: 'Muhammed Fadil MT', status: 'medical', remarks: 'Fever certificate submitted' },
        { studentId: 'JM169', studentName: 'Muhammed Falah K', status: 'present' }
      ]
    },
    {
      id: 'att-2',
      date: '2026-10-18',
      className: 'Class 02',
      period: 'Period 2',
      subject: 'Islamic Jurisprudence (Fiqh)',
      markedByTeacherId: 'usr-teacher-1',
      markedByTeacherName: 'Usthad Ibrahim Faizy',
      isDraft: false,
      updatedAt: '2026-10-18T09:30:00.000Z',
      records: [
        { studentId: 'JM156', studentName: 'Abdul Hadi C', status: 'present' },
        { studentId: 'JM157', studentName: 'Abdullah Amal Twaha', status: 'present' },
        { studentId: 'JM163', studentName: 'Azhar Zaman', status: 'present' },
        { studentId: 'JM165', studentName: 'Muhammed', status: 'present' },
        { studentId: 'JM168', studentName: 'Muhammed Fadil MT', status: 'medical', remarks: 'Medical leave' },
        { studentId: 'JM169', studentName: 'Muhammed Falah K', status: 'present' }
      ]
    },
    {
      id: 'att-3',
      date: '2026-10-19',
      className: 'Class 02',
      period: 'Period 1',
      subject: 'Quran Recitation & Hifz',
      markedByTeacherId: 'usr-teacher-2',
      markedByTeacherName: 'Usthad Kabeer Nandi',
      isDraft: false,
      updatedAt: '2026-10-19T08:50:00.000Z',
      records: [
        { studentId: 'JM156', studentName: 'Abdul Hadi C', status: 'present' },
        { studentId: 'JM157', studentName: 'Abdullah Amal Twaha', status: 'present' },
        { studentId: 'JM163', studentName: 'Azhar Zaman', status: 'present' },
        { studentId: 'JM165', studentName: 'Muhammed', status: 'absent', remarks: 'Informed travel' },
        { studentId: 'JM168', studentName: 'Muhammed Fadil MT', status: 'present' },
        { studentId: 'JM169', studentName: 'Muhammed Falah K', status: 'present' }
      ]
    }
  ];

  // CE marks
  const ceMarks: CEMarkRecord[] = [
    {
      id: 'ce-1',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'Arabic Language',
      term: 'Midterm 2026–27',
      assignmentMarks: 14,
      performanceMarks: 5,
      totalCE: 19,
      teacherRemarks: 'Excellent pronunciation and regular handwriting homework.',
      updatedBy: 'Usthad Ibrahim Faizy',
      updatedAt: '2026-10-15T10:00:00.000Z'
    },
    {
      id: 'ce-2',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'Islamic Jurisprudence (Fiqh)',
      term: 'Midterm 2026–27',
      assignmentMarks: 13,
      performanceMarks: 4,
      totalCE: 17,
      teacherRemarks: 'Very attentive during Wudu demonstration classes.',
      updatedBy: 'Usthad Ibrahim Faizy',
      updatedAt: '2026-10-15T10:00:00.000Z'
    },
    {
      id: 'ce-3',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'Mathematics',
      term: 'Midterm 2026–27',
      assignmentMarks: 15,
      performanceMarks: 5,
      totalCE: 20,
      teacherRemarks: 'Consistently completes all workbook exercises on time.',
      updatedBy: 'Prof. Abdul Rahman M.Sc',
      updatedAt: '2026-10-15T10:00:00.000Z'
    },
    {
      id: 'ce-4',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'English & Moral Studies',
      term: 'Midterm 2026–27',
      assignmentMarks: 13,
      performanceMarks: 4,
      totalCE: 17,
      teacherRemarks: 'Active participant in classroom dialogues.',
      updatedBy: 'Prof. Abdul Rahman M.Sc',
      updatedAt: '2026-10-15T10:00:00.000Z'
    },
    {
      id: 'ce-5',
      studentId: 'JM157',
      studentName: 'Abdullah Amal Twaha',
      className: 'Class 02',
      subject: 'Arabic Language',
      term: 'Midterm 2026–27',
      assignmentMarks: 12,
      performanceMarks: 4,
      totalCE: 16,
      teacherRemarks: 'Good comprehension; needs a little work on spelling.',
      updatedBy: 'Usthad Ibrahim Faizy',
      updatedAt: '2026-10-15T10:00:00.000Z'
    }
  ];

  // Exam Marks
  const examMarks: ExamMarkRecord[] = [
    {
      id: 'ex-1',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'Arabic Language',
      term: 'Midterm 2026–27',
      theoryMarks: 73,
      ceMarks: 19,
      graceMarks: 0,
      totalMarks: 92,
      isAbsent: false,
      grade: 'A+',
      status: 'Passed',
      teacherRemarks: 'Mastery in vocabulary and comprehension.',
      updatedBy: 'Usthad Ibrahim Faizy',
      updatedAt: '2026-10-16T11:00:00.000Z'
    },
    {
      id: 'ex-2',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'Islamic Jurisprudence (Fiqh)',
      term: 'Midterm 2026–27',
      theoryMarks: 68,
      ceMarks: 17,
      graceMarks: 2,
      totalMarks: 87,
      isAbsent: false,
      grade: 'A',
      status: 'Passed',
      teacherRemarks: 'Commendable understanding of practical fiqh concepts.',
      updatedBy: 'Usthad Ibrahim Faizy',
      updatedAt: '2026-10-16T11:00:00.000Z'
    },
    {
      id: 'ex-3',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'Mathematics',
      term: 'Midterm 2026–27',
      theoryMarks: 76,
      ceMarks: 20,
      graceMarks: 0,
      totalMarks: 96,
      isAbsent: false,
      grade: 'A+',
      status: 'Passed',
      teacherRemarks: 'Outstanding analytical clarity.',
      updatedBy: 'Prof. Abdul Rahman M.Sc',
      updatedAt: '2026-10-16T11:00:00.000Z'
    },
    {
      id: 'ex-4',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'English & Moral Studies',
      term: 'Midterm 2026–27',
      theoryMarks: 67,
      ceMarks: 17,
      graceMarks: 0,
      totalMarks: 84,
      isAbsent: false,
      grade: 'A',
      status: 'Passed',
      teacherRemarks: 'Very good presentation and neat handwriting.',
      updatedBy: 'Prof. Abdul Rahman M.Sc',
      updatedAt: '2026-10-16T11:00:00.000Z'
    }
  ];

  // Grace mark request
  const graceRequests: GraceMarkRequest[] = [
    {
      id: 'grc-1',
      studentId: 'JM156',
      studentName: 'Abdul Hadi C',
      className: 'Class 02',
      subject: 'Islamic Jurisprudence (Fiqh)',
      term: 'Midterm 2026–27',
      currentTheoryMarks: 68,
      requestedGrace: 2,
      justification: 'Outstanding performance in oral vivas and daily prayers register; missed question 4b due to minor headache during exam.',
      status: 'approved',
      requestedByTeacherId: 'usr-teacher-1',
      requestedByTeacherName: 'Usthad Ibrahim Faizy',
      approvedGrace: 2,
      adminRemarks: 'Approved based on teacher recommendation and continuous viva log.',
      requestedAt: '2026-10-16T12:00:00.000Z',
      decidedAt: '2026-10-17T09:00:00.000Z',
      decidedBy: 'Academy Administrator'
    },
    {
      id: 'grc-2',
      studentId: 'JM157',
      studentName: 'Abdullah Amal Twaha',
      className: 'Class 02',
      subject: 'Arabic Language',
      term: 'Midterm 2026–27',
      currentTheoryMarks: 63,
      requestedGrace: 3,
      justification: 'Deserving student who made major leaps in Tajweed and Arabic calligraphy.',
      status: 'pending',
      requestedByTeacherId: 'usr-teacher-1',
      requestedByTeacherName: 'Usthad Ibrahim Faizy',
      requestedAt: '2026-10-18T10:30:00.000Z'
    }
  ];

  const leaveRequests: LeaveRequest[] = [
    {
      id: 'lv-1',
      teacherId: 'usr-teacher-1',
      teacherName: 'Usthad Ibrahim Faizy',
      startDate: '2026-10-25',
      endDate: '2026-10-26',
      totalDays: 2,
      reason: 'Attending Samastha Ulama Conference in Malappuram',
      suggestedSubstitute: 'Usthad Kabeer Nandi',
      assignedSubstitute: 'Usthad Kabeer Nandi',
      status: 'approved',
      adminRemarks: 'Leave sanctioned. Substitution confirmed.',
      requestedAt: '2026-10-14T10:00:00.000Z',
      decidedAt: '2026-10-15T08:30:00.000Z'
    }
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      timestamp: '2026-10-14T08:00:00.000Z',
      actorId: 'usr-admin',
      actorName: 'Academy Administrator',
      actorRole: 'admin',
      category: 'account',
      action: 'SYSTEM_BOOTSTRAP',
      details: 'Darussalam Academy database initialized with primary credentials and Class 02 registers.'
    },
    {
      id: 'aud-2',
      timestamp: '2026-10-17T09:00:00.000Z',
      actorId: 'usr-admin',
      actorName: 'Academy Administrator',
      actorRole: 'admin',
      category: 'grace',
      action: 'APPROVE_GRACE_MARKS',
      details: 'Approved +2 grace marks for Abdul Hadi C (JM156) in Fiqh.'
    }
  ];

  const academicSettings: AcademicSettings = {
    medicalAttendanceRule: 'excluded', // Excluded from denominator
    examPublishedTerms: {
      'Midterm 2026–27': true,
      'Annual Examination 2026-27': false
    },
    minPassPercentage: 40,
    maxGraceMarksPerStudent: 5
  };

  const initialDb: AcademyDatabase = {
    users,
    students,
    attendance,
    ceMarks,
    examMarks,
    graceRequests,
    leaveRequests,
    auditLogs,
    academicSettings,
    cmsDraft: JSON.parse(JSON.stringify(defaultCMS)),
    cmsPublished: JSON.parse(JSON.stringify(defaultCMS)),
    cmsRevisions: [
      {
        id: 'rev-init',
        timestamp: '2026-10-10T00:00:00.000Z',
        publishedBy: 'Academy Administrator',
        content: JSON.parse(JSON.stringify(defaultCMS))
      }
    ]
  };

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

let db = initializeDatabase();

function persistDatabase() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file', err);
  }
}

function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const newEntry: AuditLogEntry = {
    id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    ...entry
  };
  db.auditLogs.unshift(newEntry);
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  persistDatabase();
}

// -------------------------------------------------------------
// PUBLIC CMS API
// -------------------------------------------------------------
app.get('/api/public/content', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.cmsPublished,
    settings: {
      establishedYear: db.cmsPublished.identity.establishedYear,
      motto: db.cmsPublished.identity.motto
    }
  });
});

// -------------------------------------------------------------
// AUTHENTICATION API
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { loginId, password, portal } = req.body;

  if (!loginId || !password) {
    return res.status(400).json({ success: false, message: 'Please enter Login ID and password.' });
  }

  const normalizedId = String(loginId).trim().toLowerCase();
  const user = db.users.find(u => u.loginId.toLowerCase() === normalizedId);

  if (!user) {
    addAuditLog({
      actorId: 'anonymous',
      actorName: 'Unregistered User',
      actorRole: 'system',
      category: 'security',
      action: 'FAILED_LOGIN_UNKNOWN_ID',
      details: `Failed login attempt for unknown ID: ${loginId}`
    });
    return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your Login ID.' });
  }

  if (user.disabled) {
    addAuditLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      category: 'security',
      action: 'LOGIN_BLOCKED_DISABLED',
      details: `Login blocked for deactivated account: ${user.loginId}`
    });
    return res.status(403).json({ success: false, message: 'This account has been deactivated. Contact academy administration.' });
  }

  // Validate portal compatibility if specified
  if (portal && portal !== user.role && !(portal === 'admin' && user.role === 'admin')) {
    // allow matching
    if ((portal === 'teacher' && user.role !== 'teacher') ||
        (portal === 'parent' && user.role !== 'parent') ||
        (portal === 'admin' && user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: `This account is authorized as a ${user.role}, not for the ${portal} portal.`
      });
    }
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    addAuditLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      category: 'security',
      action: 'FAILED_LOGIN_BAD_PASSWORD',
      details: `Failed password attempt for: ${user.loginId}`
    });
    return res.status(401).json({ success: false, message: 'Invalid credentials. Password did not match.' });
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  persistDatabase();

  addAuditLog({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    category: 'account',
    action: 'USER_LOGIN',
    details: `Successful login to ${user.role} portal by ${user.name} (${user.loginId})`
  });

  const token = 'token-' + Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64');

  res.json({
    success: true,
    session: {
      token,
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        mustChangePassword: user.mustChangePassword,
        teacherProfile: user.teacherProfile,
        parentProfile: user.parentProfile
      }
    }
  });
});

app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required parameters.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // If the user does not have mustChangePassword = true, they MUST verify currentPassword
  if (!user.mustChangePassword) {
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required.' });
    }
    const isCurrentValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: 'Current password verification failed.' });
    }
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.mustChangePassword = false;
  persistDatabase();

  addAuditLog({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    category: 'security',
    action: 'PASSWORD_CHANGED',
    details: `Password securely updated for account ${user.loginId}`
  });

  res.json({
    success: true,
    message: 'Password successfully updated.',
    mustChangePassword: false
  });
});

app.post('/api/auth/change-login-id', (req: Request, res: Response) => {
  const { userId, newLoginId, currentPassword } = req.body;

  if (!userId || !newLoginId) {
    return res.status(400).json({ success: false, message: 'Missing parameters.' });
  }

  const cleanNewId = String(newLoginId).trim();
  if (cleanNewId.length < 3) {
    return res.status(400).json({ success: false, message: 'Login ID must be at least 3 characters.' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Verify current password for sensitive credential change
  if (currentPassword) {
    const isCurrentValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: 'Password verification failed for changing Login ID.' });
    }
  }

  // Check uniqueness across ALL accounts
  const isDuplicate = db.users.some(u => u.id !== userId && u.loginId.toLowerCase() === cleanNewId.toLowerCase());
  if (isDuplicate) {
    return res.status(409).json({ success: false, message: 'This Login ID is already taken. Please choose another.' });
  }

  const oldId = user.loginId;
  user.loginId = cleanNewId;

  // If this was a parent account, update student record's parentLoginId reference without touching official admissionId
  if (user.role === 'parent' && user.parentProfile?.linkedStudentIds) {
    user.parentProfile.linkedStudentIds.forEach(stId => {
      const st = db.students.find(s => s.admissionId === stId);
      if (st) {
        st.parentLoginId = cleanNewId;
      }
    });
  }

  persistDatabase();

  addAuditLog({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    category: 'account',
    action: 'LOGIN_ID_CHANGED',
    details: `User ${user.name} changed Login ID from '${oldId}' to '${cleanNewId}'`
  });

  res.json({
    success: true,
    message: 'Login ID updated successfully.',
    newLoginId: cleanNewId
  });
});

// -------------------------------------------------------------
// ADMIN CMS MANAGEMENT API
// -------------------------------------------------------------
app.get('/api/admin/cms', (req: Request, res: Response) => {
  res.json({
    success: true,
    draft: db.cmsDraft,
    published: db.cmsPublished,
    revisions: db.cmsRevisions.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      publishedBy: r.publishedBy,
      title: r.content.identity.academyName
    }))
  });
});

app.post('/api/admin/cms/update', (req: Request, res: Response) => {
  const { draft, actorName } = req.body;
  if (!draft) {
    return res.status(400).json({ success: false, message: 'Draft content required.' });
  }

  db.cmsDraft = draft;
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: actorName || 'Admin',
    actorRole: 'admin',
    category: 'cms',
    action: 'CMS_DRAFT_UPDATED',
    details: 'Saved draft changes to Academy Homepage CMS.'
  });

  res.json({ success: true, message: 'Draft saved successfully.' });
});

app.post('/api/admin/cms/publish', (req: Request, res: Response) => {
  const { actorName } = req.body;

  db.cmsPublished = JSON.parse(JSON.stringify(db.cmsDraft));
  const newRev = {
    id: 'rev-' + Date.now(),
    timestamp: new Date().toISOString(),
    publishedBy: actorName || 'Academy Administrator',
    content: JSON.parse(JSON.stringify(db.cmsPublished))
  };

  db.cmsRevisions.unshift(newRev);
  if (db.cmsRevisions.length > 20) {
    db.cmsRevisions = db.cmsRevisions.slice(0, 20);
  }
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: actorName || 'Admin',
    actorRole: 'admin',
    category: 'cms',
    action: 'CMS_PUBLISHED',
    details: 'Published new version of Academy Public Homepage.'
  });

  res.json({ success: true, message: 'Homepage changes successfully published!' });
});

app.post('/api/admin/cms/restore', (req: Request, res: Response) => {
  const { revisionId, actorName } = req.body;
  const rev = db.cmsRevisions.find(r => r.id === revisionId);
  if (!rev) {
    return res.status(404).json({ success: false, message: 'Revision not found.' });
  }

  db.cmsDraft = JSON.parse(JSON.stringify(rev.content));
  db.cmsPublished = JSON.parse(JSON.stringify(rev.content));
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: actorName || 'Admin',
    actorRole: 'admin',
    category: 'cms',
    action: 'CMS_RESTORED',
    details: `Restored homepage content from revision dated ${rev.timestamp}`
  });

  res.json({ success: true, message: 'Content restored to previous revision.' });
});

// -------------------------------------------------------------
// ADMIN ACCOUNT MANAGEMENT (TEACHERS & PARENTS)
// -------------------------------------------------------------
app.get('/api/admin/users', (req: Request, res: Response) => {
  const safeUsers = db.users.map(u => ({
    id: u.id,
    loginId: u.loginId,
    name: u.name,
    role: u.role,
    email: u.email,
    phone: u.phone,
    mustChangePassword: u.mustChangePassword,
    disabled: u.disabled,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    teacherProfile: u.teacherProfile,
    parentProfile: u.parentProfile
  }));

  res.json({
    success: true,
    users: safeUsers,
    students: db.students
  });
});

app.post('/api/admin/users/create', (req: Request, res: Response) => {
  const { role, name, loginId, initialPassword, phone, email, teacherDetails, parentDetails, actorName } = req.body;

  if (!role || !name || !loginId || !initialPassword) {
    return res.status(400).json({ success: false, message: 'Name, Login ID, and initial password are required.' });
  }

  const cleanLoginId = String(loginId).trim();
  const exists = db.users.some(u => u.loginId.toLowerCase() === cleanLoginId.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: `Login ID '${cleanLoginId}' is already registered.` });
  }

  const { hash, salt } = hashPassword(initialPassword);
  const newUser: UserAccount & { salt: string } = {
    id: `usr-${Date.now()}`,
    loginId: cleanLoginId,
    name,
    role,
    phone,
    email,
    passwordHash: hash,
    salt,
    mustChangePassword: true, // MUST be changed on first login as per security requirement
    disabled: false,
    createdAt: new Date().toISOString()
  };

  if (role === 'teacher') {
    newUser.teacherProfile = {
      teacherId: teacherDetails?.teacherId || `TCH-${Math.floor(10 + Math.random() * 90)}`,
      designation: teacherDetails?.designation || 'Faculty Member',
      department: teacherDetails?.department || 'Islamic & General Studies',
      assignedClasses: teacherDetails?.assignedClasses || ['Class 02'],
      assignedSubjects: teacherDetails?.assignedSubjects || ['Arabic Language']
    };
  } else if (role === 'parent') {
    newUser.parentProfile = {
      linkedStudentIds: parentDetails?.linkedStudentIds || [],
      parentRelation: parentDetails?.parentRelation || 'Parent / Guardian',
      alternatePhone: parentDetails?.alternatePhone
    };
  }

  db.users.push(newUser);
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: actorName || 'Admin',
    actorRole: 'admin',
    category: 'account',
    action: `CREATE_${role.toUpperCase()}_ACCOUNT`,
    details: `Created new ${role} account for '${name}' with Login ID: '${cleanLoginId}' (Temporary password assigned)`
  });

  res.json({
    success: true,
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
    user: {
      id: newUser.id,
      loginId: newUser.loginId,
      name: newUser.name,
      role: newUser.role
    }
  });
});

app.post('/api/admin/users/reset-password', (req: Request, res: Response) => {
  const { userId, newTemporaryPassword, actorName } = req.body;
  if (!userId || !newTemporaryPassword) {
    return res.status(400).json({ success: false, message: 'User ID and temporary password are required.' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { hash, salt } = hashPassword(newTemporaryPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.mustChangePassword = true; // Force user to set their personal password upon logging in
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: actorName || 'Admin',
    actorRole: 'admin',
    category: 'security',
    action: 'ADMIN_RESET_PASSWORD',
    details: `Administrator assigned a temporary password to ${user.name} (${user.loginId}). Forced change on next login.`
  });

  res.json({ success: true, message: `Password reset. Temporary password assigned to ${user.name}.` });
});

app.post('/api/admin/users/toggle-status', (req: Request, res: Response) => {
  const { userId, actorName } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.role === 'admin' && user.loginId === 'admin') {
    return res.status(400).json({ success: false, message: 'Primary administrator cannot be disabled.' });
  }

  user.disabled = !user.disabled;
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: actorName || 'Admin',
    actorRole: 'admin',
    category: 'account',
    action: user.disabled ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED',
    details: `Account ${user.loginId} was ${user.disabled ? 'deactivated' : 'reactivated'}.`
  });

  res.json({
    success: true,
    message: `Account has been ${user.disabled ? 'disabled' : 'enabled'}.`,
    disabled: user.disabled
  });
});

app.post('/api/admin/users/link-students', (req: Request, res: Response) => {
  const { parentUserId, studentIds, actorName } = req.body;
  const user = db.users.find(u => u.id === parentUserId && u.role === 'parent');
  if (!user) {
    return res.status(404).json({ success: false, message: 'Parent account not found.' });
  }

  if (!user.parentProfile) {
    user.parentProfile = { linkedStudentIds: [], parentRelation: 'Parent' };
  }

  user.parentProfile.linkedStudentIds = studentIds;
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: actorName || 'Admin',
    actorRole: 'admin',
    category: 'account',
    action: 'LINK_STUDENTS_TO_PARENT',
    details: `Updated linked students for ${user.name}: [${studentIds.join(', ')}]`
  });

  res.json({ success: true, message: 'Linked students updated.', linkedStudentIds: studentIds });
});

// -------------------------------------------------------------
// ACADEMIC CONFIGURATION & SETTINGS
// -------------------------------------------------------------
app.get('/api/academic/meta', (req: Request, res: Response) => {
  const classes = ['Class 01', 'Class 02', 'Class 03', 'Class 04', 'Class 05', 'Class 06', 'Class 07', 'Class 08', 'Class 09', 'Class 10'];
  const periods = ['Period 1 (08:30–09:15)', 'Period 2 (09:15–10:00)', 'Period 3 (10:15–11:00)', 'Period 4 (11:00–11:45)', 'Period 5 (12:00–12:45)', 'Period 6 (01:45–02:30)', 'Period 7 (02:30–03:15)'];
  const subjects = [
    'Arabic Language',
    'Islamic Jurisprudence (Fiqh)',
    'Quran Recitation & Hifz',
    'Tajweed',
    'Moral Studies & Hadith',
    'Mathematics',
    'Environmental Science',
    'English Language',
    'Malayalam'
  ];

  res.json({
    success: true,
    classes,
    periods,
    subjects,
    settings: db.academicSettings,
    students: db.students
  });
});

app.post('/api/admin/academic/settings', (req: Request, res: Response) => {
  const { settings, actorName } = req.body;
  if (!settings) {
    return res.status(400).json({ success: false, message: 'Settings payload required.' });
  }

  db.academicSettings = {
    ...db.academicSettings,
    ...settings
  };
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: actorName || 'Admin',
    actorRole: 'admin',
    category: 'rules',
    action: 'UPDATE_ACADEMIC_SETTINGS',
    details: `Medical rule set to '${db.academicSettings.medicalAttendanceRule}'. Exam publication flags updated.`
  });

  res.json({ success: true, message: 'Academic calculation rules updated.', settings: db.academicSettings });
});

// -------------------------------------------------------------
// ATTENDANCE MODULE
// -------------------------------------------------------------
app.get('/api/attendance', (req: Request, res: Response) => {
  const { className, date, period } = req.query;

  let results = db.attendance;
  if (className) {
    results = results.filter(a => a.className === className);
  }
  if (date) {
    results = results.filter(a => a.date === date);
  }
  if (period) {
    results = results.filter(a => a.period === period);
  }

  res.json({ success: true, attendance: results });
});

app.post('/api/attendance', (req: Request, res: Response) => {
  const { session, actorName, actorId, actorRole } = req.body;
  if (!session || !session.className || !session.date || !session.period || !session.records) {
    return res.status(400).json({ success: false, message: 'Invalid attendance session structure.' });
  }

  // Find if a session already exists for this date, class, period
  const existingIdx = db.attendance.findIndex(
    a => a.className === session.className && a.date === session.date && a.period === session.period
  );

  const sessionId = existingIdx >= 0 ? db.attendance[existingIdx].id : 'att-' + Date.now();
  const newSession: PeriodAttendanceSession = {
    ...session,
    id: sessionId,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    db.attendance[existingIdx] = newSession;
  } else {
    db.attendance.push(newSession);
  }

  persistDatabase();

  addAuditLog({
    actorId: actorId || 'teacher',
    actorName: actorName || 'Teacher',
    actorRole: actorRole || 'teacher',
    category: 'attendance',
    action: session.isDraft ? 'SAVE_DRAFT_ATTENDANCE' : 'RECORD_ATTENDANCE',
    details: `${session.isDraft ? 'Saved draft' : 'Committed'} attendance for ${session.className} - ${session.period} on ${session.date} (${session.records.length} students).`
  });

  res.json({ success: true, message: 'Attendance saved successfully.', session: newSession });
});

// -------------------------------------------------------------
// CONTINUOUS EVALUATION (CE) MODULE
// -------------------------------------------------------------
app.get('/api/ce', (req: Request, res: Response) => {
  const { className, subject, studentId, term } = req.query;
  let records = db.ceMarks;

  if (className) records = records.filter(r => r.className === className);
  if (subject) records = records.filter(r => r.subject === subject);
  if (studentId) records = records.filter(r => r.studentId === studentId);
  if (term) records = records.filter(r => r.term === term);

  res.json({ success: true, records });
});

app.post('/api/ce', (req: Request, res: Response) => {
  const { marks, actorName, actorId, actorRole } = req.body;
  // marks: CEMarkRecord | CEMarkRecord[]
  if (!marks) {
    return res.status(400).json({ success: false, message: 'Marks payload required.' });
  }

  const markList: CEMarkRecord[] = Array.isArray(marks) ? marks : [marks];

  markList.forEach(m => {
    // Validate bounds: Assignment /15, Performance /5
    const assignment = Math.max(0, Math.min(15, Number(m.assignmentMarks) || 0));
    const performance = Math.max(0, Math.min(5, Number(m.performanceMarks) || 0));
    const totalCE = assignment + performance;

    const existingIdx = db.ceMarks.findIndex(
      e => e.studentId === m.studentId && e.subject === m.subject && e.term === m.term
    );

    const record: CEMarkRecord = {
      id: existingIdx >= 0 ? db.ceMarks[existingIdx].id : 'ce-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      studentId: m.studentId,
      studentName: m.studentName,
      className: m.className,
      subject: m.subject,
      term: m.term,
      assignmentMarks: assignment,
      performanceMarks: performance,
      totalCE,
      teacherRemarks: m.teacherRemarks || '',
      updatedBy: actorName || 'Teacher',
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      db.ceMarks[existingIdx] = record;
    } else {
      db.ceMarks.push(record);
    }
  });

  persistDatabase();

  addAuditLog({
    actorId: actorId || 'teacher',
    actorName: actorName || 'Teacher',
    actorRole: actorRole || 'teacher',
    category: 'ce',
    action: 'SAVE_CE_MARKS',
    details: `Updated Continuous Evaluation for ${markList.length} student records.`
  });

  res.json({ success: true, message: 'CE marks recorded successfully.' });
});

// -------------------------------------------------------------
// EXAMINATION MARKS MODULE
// -------------------------------------------------------------
function calculateGrade(total: number, isAbsent: boolean): { grade: string; status: 'Passed' | 'Failed' | 'Absent' } {
  if (isAbsent) return { grade: 'AB', status: 'Absent' };
  if (total >= 90) return { grade: 'A+', status: 'Passed' };
  if (total >= 80) return { grade: 'A', status: 'Passed' };
  if (total >= 70) return { grade: 'B+', status: 'Passed' };
  if (total >= 60) return { grade: 'B', status: 'Passed' };
  if (total >= 50) return { grade: 'C+', status: 'Passed' };
  if (total >= 40) return { grade: 'C', status: 'Passed' };
  return { grade: 'F', status: 'Failed' };
}

app.get('/api/exams', (req: Request, res: Response) => {
  const { className, subject, term, studentId } = req.query;
  let records = db.examMarks;

  if (className) records = records.filter(r => r.className === className);
  if (subject) records = records.filter(r => r.subject === subject);
  if (term) records = records.filter(r => r.term === term);
  if (studentId) records = records.filter(r => r.studentId === studentId);

  res.json({ success: true, records });
});

app.post('/api/exams', (req: Request, res: Response) => {
  const { records, actorName, actorId, actorRole } = req.body;
  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ success: false, message: 'Array of exam records required.' });
  }

  records.forEach((r: any) => {
    const isAbsent = Boolean(r.isAbsent);
    const theoryMarks = isAbsent ? 0 : Math.max(0, Math.min(80, Number(r.theoryMarks) || 0));

    // Lookup CE marks for this student and subject
    const ce = db.ceMarks.find(c => c.studentId === r.studentId && c.subject === r.subject && c.term === r.term);
    const ceMarks = ce ? ce.totalCE : (Number(r.ceMarks) || 0);

    // Lookup any approved grace marks
    const graceReq = db.graceRequests.find(
      g => g.studentId === r.studentId && g.subject === r.subject && g.term === r.term && g.status === 'approved'
    );
    const graceMarks = graceReq ? (graceReq.approvedGrace || 0) : (Number(r.graceMarks) || 0);

    const totalMarks = isAbsent ? 0 : Math.min(100, theoryMarks + ceMarks + graceMarks);
    const { grade, status } = calculateGrade(totalMarks, isAbsent);

    const existingIdx = db.examMarks.findIndex(
      e => e.studentId === r.studentId && e.subject === r.subject && e.term === r.term
    );

    const examRecord: ExamMarkRecord = {
      id: existingIdx >= 0 ? db.examMarks[existingIdx].id : 'ex-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      studentId: r.studentId,
      studentName: r.studentName,
      className: r.className,
      subject: r.subject,
      term: r.term,
      theoryMarks,
      ceMarks,
      graceMarks,
      totalMarks,
      isAbsent,
      grade,
      status,
      teacherRemarks: r.teacherRemarks || '',
      updatedBy: actorName || 'Teacher',
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      db.examMarks[existingIdx] = examRecord;
    } else {
      db.examMarks.push(examRecord);
    }
  });

  persistDatabase();

  addAuditLog({
    actorId: actorId || 'teacher',
    actorName: actorName || 'Teacher',
    actorRole: actorRole || 'teacher',
    category: 'exam',
    action: 'SAVE_EXAM_MARKS',
    details: `Updated examination marks for ${records.length} students.`
  });

  res.json({ success: true, message: 'Exam marks recorded successfully.' });
});

// -------------------------------------------------------------
// GRACE MARKS MODULE
// -------------------------------------------------------------
app.get('/api/grace/list', (req: Request, res: Response) => {
  res.json({ success: true, requests: db.graceRequests });
});

app.post('/api/grace/request', (req: Request, res: Response) => {
  const { studentId, studentName, className, subject, term, currentTheoryMarks, requestedGrace, justification, requestedByTeacherId, requestedByTeacherName } = req.body;

  if (!studentId || !subject || !requestedGrace || !justification) {
    return res.status(400).json({ success: false, message: 'All grace mark request fields are required.' });
  }

  const newReq: GraceMarkRequest = {
    id: 'grc-' + Date.now(),
    studentId,
    studentName,
    className,
    subject,
    term,
    currentTheoryMarks: Number(currentTheoryMarks) || 0,
    requestedGrace: Number(requestedGrace),
    justification,
    status: 'pending',
    requestedByTeacherId,
    requestedByTeacherName,
    requestedAt: new Date().toISOString()
  };

  db.graceRequests.unshift(newReq);
  persistDatabase();

  addAuditLog({
    actorId: requestedByTeacherId,
    actorName: requestedByTeacherName,
    actorRole: 'teacher',
    category: 'grace',
    action: 'REQUEST_GRACE_MARKS',
    details: `Teacher requested +${requestedGrace} grace marks for ${studentName} (${subject}). Justification: ${justification}`
  });

  res.json({ success: true, message: 'Grace mark proposal submitted for administrative review.', request: newReq });
});

app.post('/api/grace/decide', (req: Request, res: Response) => {
  const { requestId, status, approvedGrace, adminRemarks, adminName } = req.body;
  const reqItem = db.graceRequests.find(r => r.id === requestId);
  if (!reqItem) {
    return res.status(404).json({ success: false, message: 'Grace mark request not found.' });
  }

  reqItem.status = status;
  reqItem.approvedGrace = status === 'approved' || status === 'modified' ? Number(approvedGrace) : 0;
  reqItem.adminRemarks = adminRemarks || '';
  reqItem.decidedAt = new Date().toISOString();
  reqItem.decidedBy = adminName || 'Academy Administrator';

  // If approved or modified, automatically update the exam record for this student and subject!
  if (status === 'approved' || status === 'modified') {
    const examRecord = db.examMarks.find(
      e => e.studentId === reqItem.studentId && e.subject === reqItem.subject && e.term === reqItem.term
    );
    if (examRecord) {
      examRecord.graceMarks = reqItem.approvedGrace;
      examRecord.totalMarks = Math.min(100, examRecord.theoryMarks + examRecord.ceMarks + examRecord.graceMarks);
      const gradeResult = calculateGrade(examRecord.totalMarks, examRecord.isAbsent);
      examRecord.grade = gradeResult.grade;
      examRecord.status = gradeResult.status;
      examRecord.updatedAt = new Date().toISOString();
      examRecord.updatedBy = `${adminName || 'Admin'} (Grace mark applied)`;
    }
  }

  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: adminName || 'Admin',
    actorRole: 'admin',
    category: 'grace',
    action: `GRACE_MARKS_${status.toUpperCase()}`,
    details: `Admin ${status} grace marks for ${reqItem.studentName} in ${reqItem.subject} (+${reqItem.approvedGrace} marks).`
  });

  res.json({ success: true, message: `Grace mark request marked as ${status}.`, request: reqItem });
});

// -------------------------------------------------------------
// LEAVE & SUBSTITUTION MODULE
// -------------------------------------------------------------
app.get('/api/leaves', (req: Request, res: Response) => {
  const { teacherId } = req.query;
  let requests = db.leaveRequests;
  if (teacherId) {
    requests = requests.filter(r => r.teacherId === teacherId);
  }
  res.json({ success: true, requests });
});

app.post('/api/leaves/request', (req: Request, res: Response) => {
  const { teacherId, teacherName, startDate, endDate, totalDays, reason, suggestedSubstitute } = req.body;

  if (!teacherId || !startDate || !endDate || !reason) {
    return res.status(400).json({ success: false, message: 'All leave details are required.' });
  }

  const newLeave: LeaveRequest = {
    id: 'lv-' + Date.now(),
    teacherId,
    teacherName,
    startDate,
    endDate,
    totalDays: Number(totalDays) || 1,
    reason,
    suggestedSubstitute: suggestedSubstitute || '',
    status: 'pending',
    requestedAt: new Date().toISOString()
  };

  db.leaveRequests.unshift(newLeave);
  persistDatabase();

  addAuditLog({
    actorId: teacherId,
    actorName: teacherName,
    actorRole: 'teacher',
    category: 'leaves',
    action: 'SUBMIT_LEAVE_REQUEST',
    details: `Teacher ${teacherName} requested leave from ${startDate} to ${endDate} (${totalDays} days).`
  });

  res.json({ success: true, message: 'Leave request submitted to administration.', request: newLeave });
});

app.post('/api/leaves/decide', (req: Request, res: Response) => {
  const { leaveId, status, assignedSubstitute, adminRemarks, adminName } = req.body;
  const leave = db.leaveRequests.find(l => l.id === leaveId);
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave request not found.' });
  }

  leave.status = status;
  if (assignedSubstitute) leave.assignedSubstitute = assignedSubstitute;
  leave.adminRemarks = adminRemarks || '';
  leave.decidedAt = new Date().toISOString();
  persistDatabase();

  addAuditLog({
    actorId: 'usr-admin',
    actorName: adminName || 'Admin',
    actorRole: 'admin',
    category: 'leaves',
    action: `LEAVE_${status.toUpperCase()}`,
    details: `Leave request for ${leave.teacherName} was ${status}. Assigned substitute: ${leave.assignedSubstitute || 'None'}.`
  });

  res.json({ success: true, message: `Leave request ${status}.`, request: leave });
});

// -------------------------------------------------------------
// TIMETABLE API
// -------------------------------------------------------------
app.get('/api/timetables', (req: Request, res: Response) => {
  const { className, teacherName } = req.query;

  // Standard Darussalam Academy master schedule
  const sampleSchedule: Record<string, any[]> = {
    'Monday': [
      { period: 'Period 1', timeRange: '08:30 – 09:15', subject: 'Arabic Language', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' },
      { period: 'Period 2', timeRange: '09:15 – 10:00', subject: 'Islamic Jurisprudence (Fiqh)', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' },
      { period: 'Period 3', timeRange: '10:15 – 11:00', subject: 'Mathematics', teacherName: 'Prof. Abdul Rahman M.Sc', room: 'Hall 201' },
      { period: 'Period 4', timeRange: '11:00 – 11:45', subject: 'Quran Recitation & Hifz', teacherName: 'Usthad Kabeer Nandi', room: 'Quran Sanctuary' },
      { period: 'Period 5', timeRange: '12:00 – 12:45', subject: 'Environmental Science', teacherName: 'Prof. Abdul Rahman M.Sc', room: 'Hall 201' },
      { period: 'Period 6', timeRange: '01:45 – 02:30', subject: 'English Language', teacherName: 'Prof. Abdul Majeed', room: 'Hall 201' },
      { period: 'Period 7', timeRange: '02:30 – 03:15', subject: 'Moral Studies & Adab', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' }
    ],
    'Tuesday': [
      { period: 'Period 1', timeRange: '08:30 – 09:15', subject: 'Quran Recitation & Hifz', teacherName: 'Usthad Kabeer Nandi', room: 'Quran Sanctuary' },
      { period: 'Period 2', timeRange: '09:15 – 10:00', subject: 'Arabic Language', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' },
      { period: 'Period 3', timeRange: '10:15 – 11:00', subject: 'Mathematics', teacherName: 'Prof. Abdul Rahman M.Sc', room: 'Hall 201' },
      { period: 'Period 4', timeRange: '11:00 – 11:45', subject: 'Islamic Jurisprudence (Fiqh)', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' },
      { period: 'Period 5', timeRange: '12:00 – 12:45', subject: 'Malayalam Language', teacherName: 'Usthad Dr. Ashraf Ali', room: 'Hall 201' },
      { period: 'Period 6', timeRange: '01:45 – 02:30', subject: 'General Science', teacherName: 'Prof. Abdul Rahman M.Sc', room: 'Hall 201' },
      { period: 'Period 7', timeRange: '02:30 – 03:15', subject: 'Tajweed Practicum', teacherName: 'Usthad Kabeer Nandi', room: 'Quran Sanctuary' }
    ],
    'Wednesday': [
      { period: 'Period 1', timeRange: '08:30 – 09:15', subject: 'Arabic Grammar', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' },
      { period: 'Period 2', timeRange: '09:15 – 10:00', subject: 'Mathematics', teacherName: 'Prof. Abdul Rahman M.Sc', room: 'Hall 201' },
      { period: 'Period 3', timeRange: '10:15 – 11:00', subject: 'Islamic History & Seerah', teacherName: 'Usthad Dr. Ashraf Ali', room: 'Hall 201' },
      { period: 'Period 4', timeRange: '11:00 – 11:45', subject: 'Quran Recitation & Hifz', teacherName: 'Usthad Kabeer Nandi', room: 'Quran Sanctuary' },
      { period: 'Period 5', timeRange: '12:00 – 12:45', subject: 'English Writing Lab', teacherName: 'Prof. Abdul Majeed', room: 'Hall 201' },
      { period: 'Period 6', timeRange: '01:45 – 02:30', subject: 'Environmental Studies', teacherName: 'Prof. Abdul Rahman M.Sc', room: 'Hall 201' },
      { period: 'Period 7', timeRange: '02:30 – 03:15', subject: 'Library & Research', teacherName: 'Usthad Ibrahim Faizy', room: 'Library' }
    ],
    'Thursday': [
      { period: 'Period 1', timeRange: '08:30 – 09:15', subject: 'Quran Recitation & Hifz', teacherName: 'Usthad Kabeer Nandi', room: 'Quran Sanctuary' },
      { period: 'Period 2', timeRange: '09:15 – 10:00', subject: 'Islamic Jurisprudence (Fiqh)', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' },
      { period: 'Period 3', timeRange: '10:15 – 11:00', subject: 'Arabic Conversation', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' },
      { period: 'Period 4', timeRange: '11:00 – 11:45', subject: 'Mathematics Problem Solving', teacherName: 'Prof. Abdul Rahman M.Sc', room: 'Hall 201' },
      { period: 'Period 5', timeRange: '12:00 – 12:45', subject: 'Moral Values & Duas', teacherName: 'Usthad Ibrahim Faizy', room: 'Hall 201' },
      { period: 'Period 6', timeRange: '01:45 – 02:30', subject: 'Calligraphy & Art', teacherName: 'Usthad Kabeer Nandi', room: 'Art Hall' },
      { period: 'Period 7', timeRange: '02:30 – 03:15', subject: 'Weekly Assembly & Halaqah', teacherName: 'All Faculty', room: 'Grand Masjid' }
    ]
  };

  res.json({ success: true, schedule: sampleSchedule });
});

// -------------------------------------------------------------
// PARENT AUTHORIZED PORTAL DATA API
// -------------------------------------------------------------
app.get('/api/parent/student-data', (req: Request, res: Response) => {
  const { studentId, parentLoginId } = req.query;

  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Student ID required.' });
  }

  const student = db.students.find(s => s.admissionId === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student record not found.' });
  }

  // Attendance for this student
  const studentAttendanceSessions = db.attendance.filter(
    a => !a.isDraft && a.records.some(r => r.studentId === studentId)
  );

  let presentCount = 0;
  let absentCount = 0;
  let medicalCount = 0;

  const attendanceLogs: any[] = [];

  studentAttendanceSessions.forEach(sess => {
    const item = sess.records.find(r => r.studentId === studentId);
    if (!item) return;

    if (item.status === 'present') presentCount++;
    else if (item.status === 'absent') absentCount++;
    else if (item.status === 'medical') medicalCount++;

    attendanceLogs.push({
      date: sess.date,
      period: sess.period,
      subject: sess.subject,
      status: item.status,
      remarks: item.remarks || '',
      teacherName: sess.markedByTeacherName
    });
  });

  // Calculate percentage based on admin medicalAttendanceRule
  const rule = db.academicSettings.medicalAttendanceRule;
  let attendancePercentage = 100;
  let effectiveDenominator = 0;

  if (rule === 'present') {
    effectiveDenominator = presentCount + absentCount + medicalCount;
    attendancePercentage = effectiveDenominator > 0 ? Math.round(((presentCount + medicalCount) / effectiveDenominator) * 100) : 100;
  } else if (rule === 'absent') {
    effectiveDenominator = presentCount + absentCount + medicalCount;
    attendancePercentage = effectiveDenominator > 0 ? Math.round((presentCount / effectiveDenominator) * 100) : 100;
  } else {
    // 'excluded'
    effectiveDenominator = presentCount + absentCount;
    attendancePercentage = effectiveDenominator > 0 ? Math.round((presentCount / effectiveDenominator) * 100) : 100;
  }

  // Continuous Evaluation marks
  const ceList = db.ceMarks.filter(c => c.studentId === studentId);

  // Exam Marks: ONLY terms published by Administrator
  const publishedTerms = db.academicSettings.examPublishedTerms || {};
  const studentExams = db.examMarks.filter(e => e.studentId === studentId);

  // Group by term
  const examTermsReport: Record<string, { isPublished: boolean; records: ExamMarkRecord[] }> = {};

  studentExams.forEach(ex => {
    if (!examTermsReport[ex.term]) {
      const isPub = Boolean(publishedTerms[ex.term]);
      examTermsReport[ex.term] = {
        isPublished: isPub,
        records: []
      };
    }
    // Only include actual records if authorized published, or indicate pending
    if (examTermsReport[ex.term].isPublished) {
      examTermsReport[ex.term].records.push(ex);
    }
  });

  // Calculate overall performance summary if published results exist
  const publishedExamRecords = Object.values(examTermsReport)
    .filter(t => t.isPublished)
    .flatMap(t => t.records);

  let averageMarks = 0;
  let overallGrade = '—';
  if (publishedExamRecords.length > 0) {
    const totalScore = publishedExamRecords.reduce((acc, curr) => acc + curr.totalMarks, 0);
    averageMarks = Math.round(totalScore / publishedExamRecords.length);
    overallGrade = calculateGrade(averageMarks, false).grade;
  }

  let ceAvg = 0;
  if (ceList.length > 0) {
    const ceTotal = ceList.reduce((acc, curr) => acc + curr.totalCE, 0);
    ceAvg = Math.round((ceTotal / ceList.length) * 10) / 10;
  }

  res.json({
    success: true,
    student,
    stats: {
      attendancePercentage,
      presentPeriods: presentCount,
      absentPeriods: absentCount,
      medicalPeriods: medicalCount,
      totalTrackedPeriods: presentCount + absentCount + medicalCount,
      averageMarks: publishedExamRecords.length > 0 ? averageMarks : null,
      ceAverage: ceList.length > 0 ? ceAvg : null,
      overallGrade: publishedExamRecords.length > 0 ? overallGrade : null,
      medicalRule: rule
    },
    attendanceLogs: attendanceLogs.sort((a, b) => b.date.localeCompare(a.date)),
    ceRecords: ceList,
    examReports: examTermsReport,
    notices: db.cmsPublished.notices
  });
});

// -------------------------------------------------------------
// AUDIT LOGS API
// -------------------------------------------------------------
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, logs: db.auditLogs });
});

// -------------------------------------------------------------
// SEED & RESET API
// -------------------------------------------------------------
app.post('/api/admin/reset-sample-data', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
    db = initializeDatabase();
    res.json({ success: true, message: 'Darussalam Academy database reinitialized with standard demo dataset.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// DEV / PROD SERVER SETUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Darussalam Academy] Full-stack application running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
