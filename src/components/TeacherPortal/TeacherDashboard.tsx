import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  BookOpen, 
  Award, 
  Clock, 
  Calendar, 
  User, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Copy, 
  Save, 
  Plus, 
  Search,
  Check,
  ChevronRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { 
  AuthSession, 
  PeriodAttendanceSession, 
  PeriodAttendanceItem, 
  CEMarkRecord, 
  ExamMarkRecord, 
  GraceMarkRequest,
  StudentRecord
} from '../../types/academy';
import { 
  fetchAcademicMeta, 
  fetchAttendance, 
  saveAttendance, 
  fetchCEMarks, 
  saveCEMarks, 
  fetchExamMarks, 
  saveExamMarks, 
  requestGraceMarks, 
  fetchGraceRequests, 
  fetchTimetables, 
  fetchLeaves, 
  requestLeave,
  changePassword,
  changeLoginId
} from '../../services/api';

interface TeacherDashboardProps {
  session: AuthSession;
  onLogout: () => void;
  onUpdateSessionUser: (updatedUser: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  session,
  onLogout,
  onUpdateSessionUser
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'attendance' | 'ce' | 'exams' | 'grace' | 'timetable' | 'leaves' | 'profile'
  >('attendance');

  // Academic Meta
  const [classes, setClasses] = useState<string[]>(['Class 02', 'Class 03', 'Class 04']);
  const [periods, setPeriods] = useState<string[]>([
    'Period 1 (08:30–09:15)',
    'Period 2 (09:15–10:00)',
    'Period 3 (10:15–11:00)',
    'Period 4 (11:00–11:45)',
    'Period 5 (12:00–12:45)',
    'Period 6 (01:45–02:30)',
    'Period 7 (02:30–03:15)'
  ]);
  const [subjects, setSubjects] = useState<string[]>([
    'Arabic Language',
    'Islamic Jurisprudence (Fiqh)',
    'Quran Recitation & Hifz',
    'Tajweed',
    'Moral Studies & Hadith',
    'Mathematics'
  ]);
  const [students, setStudents] = useState<StudentRecord[]>([]);

  // Attendance State
  const [selectedDate, setSelectedDate] = useState('2026-10-19');
  const [selectedClass, setSelectedClass] = useState('Class 02');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1 (08:30–09:15)');
  const [selectedSubject, setSelectedSubject] = useState('Arabic Language');
  const [attendanceRegister, setAttendanceRegister] = useState<PeriodAttendanceItem[]>([]);
  const [attendanceNotice, setAttendanceNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [csvCopied, setCsvCopied] = useState(false);

  // CE State
  const [ceClass, setCeClass] = useState('Class 02');
  const [ceSubject, setCeSubject] = useState('Arabic Language');
  const [ceTerm, setCeTerm] = useState('Midterm 2026–27');
  const [ceRecords, setCeRecords] = useState<Record<string, { assignment: number; performance: number; remarks: string }>>({});
  const [ceNotice, setCeNotice] = useState<string | null>(null);

  // Exam Marks State
  const [examClass, setExamClass] = useState('Class 02');
  const [examSubject, setExamSubject] = useState('Arabic Language');
  const [examTerm, setExamTerm] = useState('Midterm 2026–27');
  const [examInputs, setExamInputs] = useState<Record<string, { theory: number; isAbsent: boolean; remarks: string }>>({});
  const [examNotice, setExamNotice] = useState<string | null>(null);

  // Grace Marks State
  const [graceRequests, setGraceRequests] = useState<GraceMarkRequest[]>([]);
  const [isGraceModalOpen, setIsGraceModalOpen] = useState(false);
  const [graceStudentId, setGraceStudentId] = useState('');
  const [graceSubject, setGraceSubject] = useState('Arabic Language');
  const [graceProposedMarks, setGraceProposedMarks] = useState(2);
  const [graceJustification, setGraceJustification] = useState('');
  const [graceNotice, setGraceNotice] = useState<string | null>(null);

  // Timetable & Leaves State
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, any[]>>({});
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveStart, setLeaveStart] = useState('2026-10-25');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-26');
  const [leaveDays, setLeaveDays] = useState(2);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubstitute, setLeaveSubstitute] = useState('Usthad Kabeer Nandi');
  const [leaveNotice, setLeaveNotice] = useState<string | null>(null);

  // Profile / Credentials State
  const [newTeacherLoginId, setNewTeacherLoginId] = useState(session.user.loginId);
  const [verifyCurrentPass, setVerifyCurrentPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileNotice, setProfileNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Initial Academic Meta & Students
  useEffect(() => {
    loadMetaAndData();
  }, []);

  const loadMetaAndData = async () => {
    try {
      const meta = await fetchAcademicMeta();
      if (meta.classes) setClasses(meta.classes);
      if (meta.periods) setPeriods(meta.periods);
      if (meta.subjects) setSubjects(meta.subjects);
      if (meta.students) {
        setStudents(meta.students);
        initAttendanceRegister(meta.students, 'Class 02');
      }

      // Load timetables
      const tData = await fetchTimetables('Class 02');
      if (tData.schedule) setWeeklySchedule(tData.schedule);

      // Load leaves
      const lData = await fetchLeaves(session.user.id);
      if (lData.requests) setLeaveRequests(lData.requests);

      // Load grace mark requests
      const gData = await fetchGraceRequests();
      if (gData.requests) setGraceRequests(gData.requests);
    } catch (err) {
      console.error('Error loading meta data', err);
    }
  };

  const initAttendanceRegister = (allStudents: StudentRecord[], targetClass: string) => {
    const classStudents = allStudents.filter(s => s.class === targetClass);
    const initialList: PeriodAttendanceItem[] = classStudents.map(s => ({
      studentId: s.admissionId,
      studentName: s.name,
      status: 'present'
    }));
    setAttendanceRegister(initialList);
  };

  // When class changes in attendance
  const handleClassChange = (c: string) => {
    setSelectedClass(c);
    initAttendanceRegister(students, c);
  };

  // Attendance Actions
  const setAllPresent = () => {
    setAttendanceRegister(prev => prev.map(item => ({ ...item, status: 'present' })));
  };

  const updateStudentStatus = (studentId: string, status: 'present' | 'absent' | 'medical') => {
    setAttendanceRegister(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const updateStudentRemarks = (studentId: string, remarks: string) => {
    setAttendanceRegister(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const handleSaveAttendance = async (isDraft: boolean) => {
    setIsSavingAttendance(true);
    setAttendanceNotice(null);

    const sessionPayload: Partial<PeriodAttendanceSession> = {
      date: selectedDate,
      className: selectedClass,
      period: selectedPeriod.split(' ')[0] + ' ' + selectedPeriod.split(' ')[1], // 'Period 1'
      subject: selectedSubject,
      markedByTeacherId: session.user.id,
      markedByTeacherName: session.user.name,
      isDraft,
      records: attendanceRegister
    };

    try {
      const res = await saveAttendance(sessionPayload, session.user.name, session.user.id, session.user.role);
      setAttendanceNotice({
        type: 'success',
        text: isDraft ? 'Attendance draft saved successfully.' : 'Period attendance committed to official school register!'
      });
      setTimeout(() => setAttendanceNotice(null), 4000);
    } catch (err: any) {
      setAttendanceNotice({ type: 'error', text: err.message || 'Failed to save attendance' });
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleCopyCSV = () => {
    const header = "Student ID,Student Name,Class,Period,Date,Status,Remarks\n";
    const rows = attendanceRegister.map(r => 
      `"${r.studentId}","${r.studentName}","${selectedClass}","${selectedPeriod}","${selectedDate}","${r.status}","${r.remarks || ''}"`
    ).join("\n");
    
    navigator.clipboard.writeText(header + rows);
    setCsvCopied(true);
    setTimeout(() => setCsvCopied(false), 2500);
  };

  // CE Marks Handler
  const handleLoadCE = async () => {
    try {
      const res = await fetchCEMarks(ceClass, ceSubject, ceTerm);
      const map: Record<string, { assignment: number; performance: number; remarks: string }> = {};
      if (res.records) {
        res.records.forEach((r: CEMarkRecord) => {
          map[r.studentId] = {
            assignment: r.assignmentMarks,
            performance: r.performanceMarks,
            remarks: r.teacherRemarks || ''
          };
        });
      }
      setCeRecords(map);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    handleLoadCE();
  }, [ceClass, ceSubject, ceTerm]);

  const handleSaveCE = async () => {
    const classStudents = students.filter(s => s.class === ceClass);
    const recordsPayload: any[] = classStudents.map(s => {
      const entry = ceRecords[s.admissionId] || { assignment: 12, performance: 4, remarks: '' };
      return {
        studentId: s.admissionId,
        studentName: s.name,
        className: ceClass,
        subject: ceSubject,
        term: ceTerm,
        assignmentMarks: entry.assignment,
        performanceMarks: entry.performance,
        teacherRemarks: entry.remarks
      };
    });

    try {
      await saveCEMarks(recordsPayload, session.user.name, session.user.id, session.user.role);
      setCeNotice('Continuous Evaluation marks saved and synchronized with academic records.');
      setTimeout(() => setCeNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save CE marks');
    }
  };

  // Exam Marks Handler
  const handleLoadExams = async () => {
    try {
      const res = await fetchExamMarks(examClass, examSubject, examTerm);
      const map: Record<string, { theory: number; isAbsent: boolean; remarks: string }> = {};
      if (res.records) {
        res.records.forEach((r: ExamMarkRecord) => {
          map[r.studentId] = {
            theory: r.theoryMarks,
            isAbsent: r.isAbsent,
            remarks: r.teacherRemarks || ''
          };
        });
      }
      setExamInputs(map);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    handleLoadExams();
  }, [examClass, examSubject, examTerm]);

  const handleSaveExams = async () => {
    const classStudents = students.filter(s => s.class === examClass);
    const payload = classStudents.map(s => {
      const input = examInputs[s.admissionId] || { theory: 65, isAbsent: false, remarks: '' };
      return {
        studentId: s.admissionId,
        studentName: s.name,
        className: examClass,
        subject: examSubject,
        term: examTerm,
        theoryMarks: input.theory,
        isAbsent: input.isAbsent,
        teacherRemarks: input.remarks
      };
    });

    try {
      await saveExamMarks(payload, session.user.name, session.user.id, session.user.role);
      setExamNotice('Examination marks submitted. Automatic grade calculations and totals updated.');
      setTimeout(() => setExamNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save exam marks');
    }
  };

  // Submit Grace Mark Request
  const handleSubmitGraceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.admissionId === graceStudentId);
    if (!student) return;

    try {
      await requestGraceMarks({
        studentId: student.admissionId,
        studentName: student.name,
        className: student.class,
        subject: graceSubject,
        term: 'Midterm 2026–27',
        currentTheoryMarks: 65,
        requestedGrace: graceProposedMarks,
        justification: graceJustification,
        requestedByTeacherId: session.user.id,
        requestedByTeacherName: session.user.name
      });
      setIsGraceModalOpen(false);
      setGraceJustification('');
      setGraceNotice('Grace mark proposal forwarded to Chief Administrator for authorized review.');
      setTimeout(() => setGraceNotice(null), 4000);
      const g = await fetchGraceRequests();
      if (g.requests) setGraceRequests(g.requests);
    } catch (err: any) {
      alert(err.message || 'Failed to submit grace request');
    }
  };

  // Submit Leave Request
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestLeave({
        teacherId: session.user.id,
        teacherName: session.user.name,
        startDate: leaveStart,
        endDate: leaveEnd,
        totalDays: leaveDays,
        reason: leaveReason,
        suggestedSubstitute: leaveSubstitute
      });
      setLeaveReason('');
      setLeaveNotice('Leave request submitted for administrative sanctioning.');
      setTimeout(() => setLeaveNotice(null), 3500);
      const l = await fetchLeaves(session.user.id);
      if (l.requests) setLeaveRequests(l.requests);
    } catch (err: any) {
      alert(err.message || 'Failed to submit leave');
    }
  };

  // Update Profile / Change Password & ID
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);

    if (newPassword.length < 6) {
      setProfileNotice({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setProfileNotice({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      await changePassword(session.user.id, verifyCurrentPass, newPassword);
      setProfileNotice({ type: 'success', text: 'Your password was updated securely in the database.' });
      setVerifyCurrentPass('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setProfileNotice({ type: 'error', text: err.message || 'Password update failed.' });
    }
  };

  const handleUpdateLoginId = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);

    try {
      const res = await changeLoginId(session.user.id, newTeacherLoginId, verifyCurrentPass);
      setProfileNotice({ type: 'success', text: `Teacher Login ID changed to '${res.newLoginId}'.` });
      onUpdateSessionUser({ ...session.user, loginId: res.newLoginId });
    } catch (err: any) {
      setProfileNotice({ type: 'error', text: err.message || 'Failed to change Login ID' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-16">
      
      {/* Top Banner Matching Prompt */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-academy text-xl sm:text-2xl font-bold tracking-tight text-amber-200">
                Darussalam Academy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-900 text-emerald-300 border border-emerald-800">
                NANDI • TEACHER PORTAL
              </span>
            </div>
            <p className="text-xs text-emerald-300 font-medium tracking-wide mt-0.5">
              Teacher workspace • Authorized access • Faculty: <span className="text-white font-bold">{session.user.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-200 font-mono bg-emerald-900/60 px-3 py-1 rounded-lg border border-emerald-800">
              ID: {session.user.loginId}
            </span>
            <button
              onClick={onLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-850 text-amber-200 border border-emerald-700/80 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Workspace Navigation Menu Matching Prompt */}
        <div className="bg-white rounded-2xl border border-stone-200 p-2 mb-6 shadow-xs">
          <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100 text-[11px] font-bold uppercase tracking-widest text-stone-400">
            <span>WORKSPACE MENU</span>
            <span>Academic Year 2026–27</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {[
              { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
              { id: 'ce', label: 'CE Work', icon: BookOpen },
              { id: 'exams', label: 'Exam Marks', icon: Award },
              { id: 'grace', label: 'Grace Marks', icon: Sparkles },
              { id: 'timetable', label: 'Timetable', icon: Clock },
              { id: 'leaves', label: 'Leave & Changes', icon: Calendar },
              { id: 'profile', label: 'My Profile', icon: User }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-900 text-amber-200 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. PERIOD ATTENDANCE MODULE (Exact layout from Prompt) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div>
                  <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                    Period Attendance
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Mark attendance separately for every class period. Saved records immediately update the academy register and synchronize with parent view.
                  </p>
                </div>

                {/* Date / Class / Period Selectors matching prompt */}
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-medium text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-medium text-stone-800"
                    >
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Period
                    </label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-medium text-stone-800"
                    >
                      {periods.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-medium text-stone-800"
                    >
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Student Register Header & Actions */}
              <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
                    Student Register
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    ({attendanceRegister.length} enrolled students in {selectedClass})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={setAllPresent}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>All Present</span>
                  </button>

                  <button
                    onClick={handleCopyCSV}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-stone-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{csvCopied ? 'Copied CSV!' : 'Copy CSV'}</span>
                  </button>
                </div>
              </div>

              {/* Notice */}
              {attendanceNotice && (
                <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  attendanceNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{attendanceNotice.text}</span>
                </div>
              )}

              {/* Student Register List matching prompt */}
              <div className="mt-5 border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
                {attendanceRegister.map(student => {
                  const studentMeta = students.find(s => s.admissionId === student.studentId);
                  const parentPhone = studentMeta ? studentMeta.parentPhone : '+91 98471 •••••';
                  
                  return (
                    <div
                      key={student.studentId}
                      className="p-4 bg-white hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-stone-900">
                            {student.studentName}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                            {student.studentId}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Parent: <span className="font-mono">{parentPhone}</span> • Roll: {studentMeta?.rollNumber || '—'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status buttons */}
                        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                          <button
                            type="button"
                            onClick={() => updateStudentStatus(student.studentId, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              student.status === 'present'
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            Present
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => updateStudentStatus(student.studentId, 'absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              student.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStudentStatus(student.studentId, 'medical')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              student.status === 'medical'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            Medical
                          </button>
                        </div>

                        {/* Remarks input */}
                        <input
                          type="text"
                          placeholder="Optional remark..."
                          value={student.remarks || ''}
                          onChange={(e) => updateStudentRemarks(student.studentId, e.target.value)}
                          className="text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 w-36 focus:w-48 transition-all focus:outline-hidden focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions matching prompt */}
              <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-stone-500 italic">
                  Production version: downloadable CSV, permanent records, edit history, and parent-visible attendance percentages and remarks.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    disabled={isSavingAttendance}
                    onClick={() => handleSaveAttendance(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 transition-colors"
                  >
                    Save Draft
                  </button>

                  <button
                    disabled={isSavingAttendance}
                    onClick={() => handleSaveAttendance(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-amber-200 shadow-sm transition-all flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Commit Attendance</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. CE WORK MODULE (Assignment /15 + Performance /5 = 20) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ce' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div>
                <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                  Continuous Evaluation (CE Work)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  CE = Assignment (max 15) + Class Performance (max 5) = Total CE (max 20).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={ceClass}
                  onChange={(e) => setCeClass(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium"
                >
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                  value={ceSubject}
                  onChange={(e) => setCeSubject(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium"
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  value={ceTerm}
                  onChange={(e) => setCeTerm(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium"
                >
                  <option value="Midterm 2026–27">Midterm 2026–27</option>
                  <option value="Annual Examination 2026-27">Annual Examination 2026-27</option>
                </select>
              </div>
            </div>

            {ceNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{ceNotice}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-y border-stone-200">
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Student</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px] text-center w-28">Assignment (/15)</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px] text-center w-28">Performance (/5)</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px] text-center w-24">Total CE (/20)</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {students.filter(s => s.class === ceClass).map(st => {
                    const entry = ceRecords[st.admissionId] || { assignment: 13, performance: 4, remarks: '' };
                    const total = (Number(entry.assignment) || 0) + (Number(entry.performance) || 0);

                    return (
                      <tr key={st.admissionId} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-900 block">{st.name}</span>
                          <span className="text-[11px] text-stone-500 font-mono">{st.admissionId}</span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            max={15}
                            value={entry.assignment}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(15, Number(e.target.value) || 0));
                              setCeRecords(prev => ({
                                ...prev,
                                [st.admissionId]: { ...entry, assignment: val }
                              }));
                            }}
                            className="w-16 px-2 py-1 text-center font-bold bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={entry.performance}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(5, Number(e.target.value) || 0));
                              setCeRecords(prev => ({
                                ...prev,
                                [st.admissionId]: { ...entry, performance: val }
                              }));
                            }}
                            className="w-16 px-2 py-1 text-center font-bold bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md text-xs">
                            {total} / 20
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Teacher feedback for parents..."
                            value={entry.remarks}
                            onChange={(e) => {
                              setCeRecords(prev => ({
                                ...prev,
                                [st.admissionId]: { ...entry, remarks: e.target.value }
                              }));
                            }}
                            className="w-full px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={handleSaveCE}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-amber-200 shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save CE Records</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. EXAM MARKS MODULE (Theory /80 + CE /20 = 100) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'exams' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div>
                <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                  Examination Marks
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Theory (max 80) + CE pull (max 20) = Total (100). Explicit Absent retention as required.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={examClass}
                  onChange={(e) => setExamClass(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium"
                >
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium"
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  value={examTerm}
                  onChange={(e) => setExamTerm(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium"
                >
                  <option value="Midterm 2026–27">Midterm 2026–27</option>
                  <option value="Annual Examination 2026-27">Annual Examination 2026-27</option>
                </select>
              </div>
            </div>

            {examNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{examNotice}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-y border-stone-200">
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Student</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px] text-center w-28">Status</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px] text-center w-28">Theory (/80)</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px] text-center w-24">CE (/20)</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px] text-center w-24">Total (/100)</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {students.filter(s => s.class === examClass).map(st => {
                    const input = examInputs[st.admissionId] || { theory: 68, isAbsent: false, remarks: '' };
                    const ceEntry = ceRecords[st.admissionId] || { assignment: 13, performance: 4, remarks: '' };
                    const ceScore = (Number(ceEntry.assignment) || 0) + (Number(ceEntry.performance) || 0);
                    const totalScore = input.isAbsent ? 0 : Math.min(100, (Number(input.theory) || 0) + ceScore);

                    return (
                      <tr key={st.admissionId} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-900 block">{st.name}</span>
                          <span className="text-[11px] text-stone-500 font-mono">{st.admissionId}</span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setExamInputs(prev => ({
                                ...prev,
                                [st.admissionId]: { ...input, isAbsent: !input.isAbsent }
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                              input.isAbsent
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {input.isAbsent ? 'Absent' : 'Present'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            max={80}
                            disabled={input.isAbsent}
                            value={input.isAbsent ? 0 : input.theory}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(80, Number(e.target.value) || 0));
                              setExamInputs(prev => ({
                                ...prev,
                                [st.admissionId]: { ...input, theory: val }
                              }));
                            }}
                            className="w-16 px-2 py-1 text-center font-bold bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700 disabled:opacity-40"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
                            {ceScore}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-emerald-950 bg-emerald-100 px-2.5 py-1 rounded-md">
                            {input.isAbsent ? 'AB' : `${totalScore}`}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Academic remark..."
                            value={input.remarks}
                            onChange={(e) => {
                              setExamInputs(prev => ({
                                ...prev,
                                [st.admissionId]: { ...input, remarks: e.target.value }
                              }));
                            }}
                            className="w-full px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={handleSaveExams}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-amber-200 shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Exam Marks</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. GRACE MARKS MODULE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'grace' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div>
                <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                  Grace Marks Requests
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Submit grace mark proposals with pedagogical justification. Decisions are audited and sanctioned by the Administrator.
                </p>
              </div>

              <button
                onClick={() => {
                  setGraceStudentId(students[0]?.admissionId || '');
                  setIsGraceModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-amber-200 shadow-sm flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request Grace Marks</span>
              </button>
            </div>

            {graceNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{graceNotice}</span>
              </div>
            )}

            <div className="space-y-3">
              {graceRequests.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">No grace mark requests logged.</p>
              ) : (
                graceRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{req.studentName}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-200/80 text-stone-700">
                          {req.studentId} • {req.className}
                        </span>
                        <span className="text-xs font-semibold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                          {req.subject}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        <span className="font-semibold text-stone-700">Justification:</span> "{req.justification}"
                      </p>
                      {req.adminRemarks && (
                        <p className="text-xs text-amber-900 mt-1 font-medium bg-amber-50 p-1.5 rounded-lg border border-amber-200/60">
                          Admin Decision: {req.adminRemarks}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-sm text-stone-900">+{req.requestedGrace} Marks</span>
                        <span className="block text-[10px] text-stone-400">Proposed</span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : req.status === 'modified'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Grace Mark Modal */}
            {isGraceModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 shadow-2xl p-6 w-full max-w-md">
                  <h3 className="font-serif-academy text-lg font-bold text-emerald-950 mb-1">
                    Submit Grace Mark Proposal
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    State the academic justification for consideration by the Academy Administrator.
                  </p>

                  <form onSubmit={handleSubmitGraceRequest} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">Select Student</label>
                      <select
                        value={graceStudentId}
                        onChange={(e) => setGraceStudentId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      >
                        {students.map(s => (
                          <option key={s.admissionId} value={s.admissionId}>
                            {s.name} ({s.admissionId} - {s.class})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">Subject</label>
                      <select
                        value={graceSubject}
                        onChange={(e) => setGraceSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      >
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">Proposed Grace Marks (1 to 5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        required
                        value={graceProposedMarks}
                        onChange={(e) => setGraceProposedMarks(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">Justification</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Exceptional viva voce participation and continuous recitation attendance..."
                        value={graceJustification}
                        onChange={(e) => setGraceJustification(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsGraceModalOpen(false)}
                        className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-900 text-amber-200 font-bold rounded-xl shadow-xs hover:bg-emerald-950"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. TIMETABLE MODULE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'timetable' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                Weekly Class Timetable
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Personal teaching schedule across assigned academic and Islamic science periods.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(weeklySchedule).map(([day, slots]) => (
                <div key={day} className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
                  <div className="bg-emerald-950 text-amber-200 py-2.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>{day}</span>
                    <span className="text-[10px] text-emerald-300">7 Periods</span>
                  </div>
                  <div className="p-3 space-y-2.5">
                    {slots.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-stone-200/80 text-xs shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                          <span>{s.period}</span>
                          <span>{s.timeRange}</span>
                        </div>
                        <p className="font-bold text-emerald-950 mt-1 text-xs">
                          {s.subject}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5 flex items-center justify-between">
                          <span>{s.room}</span>
                          <span className="text-stone-400 font-mono text-[10px]">{s.teacherName.split(' ')[0]}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6. LEAVE & SUBSTITUTION MODULE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'leaves' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif-academy text-xl font-bold text-emerald-950">
                  Apply for Leave
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Propose dates and suggested faculty substitute.
                </p>
              </div>

              {leaveNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{leaveNotice}</span>
                </div>
              )}

              <form onSubmit={handleSubmitLeave} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Total Days</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Reason for Absence</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Attending Islamic seminar / family emergency..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Suggested Faculty Substitute</label>
                  <input
                    type="text"
                    value={leaveSubstitute}
                    onChange={(e) => setLeaveSubstitute(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-200 font-bold shadow-xs transition-colors"
                >
                  Submit Leave Request
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="font-serif-academy text-xl font-bold text-emerald-950">
                Leave Request History
              </h3>

              <div className="space-y-3">
                {leaveRequests.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">No leave records logged.</p>
                ) : (
                  leaveRequests.map(l => (
                    <div
                      key={l.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">
                            {l.startDate} to {l.endDate} ({l.totalDays} {l.totalDays > 1 ? 'days' : 'day'})
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            l.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                        <p className="text-stone-600 mt-1">Reason: {l.reason}</p>
                        {l.assignedSubstitute && (
                          <p className="text-stone-500 text-[11px] mt-0.5">
                            Assigned Substitute: <span className="font-semibold">{l.assignedSubstitute}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 7. MY PROFILE & ACCOUNT SETTINGS (Teacher ID & Password change) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Change Login ID */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="font-serif-academy text-lg font-bold text-emerald-950">
                Teacher Login ID Settings
              </h3>
              <p className="text-xs text-stone-500">
                Update your login identifier. Uniqueness check is enforced across all academy accounts.
              </p>

              {profileNotice && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  profileNotice.type === 'success' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateLoginId} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">New Teacher Login ID</label>
                  <input
                    type="text"
                    required
                    value={newTeacherLoginId}
                    onChange={(e) => setNewTeacherLoginId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Current Password (For Security Verification)</label>
                  <input
                    type="password"
                    required
                    value={verifyCurrentPass}
                    onChange={(e) => setVerifyCurrentPass(e.target.value)}
                    placeholder="Verify identity"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-200 font-bold transition-colors"
                >
                  Change Teacher ID
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="font-serif-academy text-lg font-bold text-emerald-950">
                Change Password
              </h3>
              <p className="text-xs text-stone-500">
                Password must be at least 6 characters and is securely encrypted in the database.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={verifyCurrentPass}
                    onChange={(e) => setVerifyCurrentPass(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition-colors"
                >
                  Update Password
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
