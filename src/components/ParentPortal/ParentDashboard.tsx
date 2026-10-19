import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  Award, 
  Clock, 
  Calendar, 
  User, 
  Printer, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import { AuthSession, StudentRecord, CEMarkRecord, ExamMarkRecord } from '../../types/academy';
import { fetchParentStudentData, fetchTimetables, changePassword, changeLoginId } from '../../services/api';

interface ParentDashboardProps {
  session: AuthSession;
  onLogout: () => void;
  onUpdateSessionUser: (user: any) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  session,
  onLogout,
  onUpdateSessionUser
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendance' | 'ce' | 'exams' | 'progress' | 'timetable' | 'notices' | 'profile'
  >('overview');

  // Support multiple students linked to parent
  const linkedStudentIds = session.user.parentProfile?.linkedStudentIds || ['JM156'];
  const [selectedStudentId, setSelectedStudentId] = useState(linkedStudentIds[0] || 'JM156');

  const [studentData, setStudentData] = useState<{
    student: StudentRecord;
    stats: {
      attendancePercentage: number;
      presentPeriods: number;
      absentPeriods: number;
      medicalPeriods: number;
      totalTrackedPeriods: number;
      averageMarks: number | null;
      ceAverage: number | null;
      overallGrade: string | null;
      medicalRule: string;
    };
    attendanceLogs: any[];
    ceRecords: CEMarkRecord[];
    examReports: Record<string, { isPublished: boolean; records: ExamMarkRecord[] }>;
    notices: any[];
  } | null>(null);

  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Profile Settings
  const [parentLoginIdInput, setParentLoginIdInput] = useState(session.user.loginId);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileNotice, setProfileNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData(selectedStudentId);
  }, [selectedStudentId]);

  const loadData = async (stId: string) => {
    setIsLoading(true);
    try {
      const res = await fetchParentStudentData(stId);
      if (res.success) {
        setStudentData(res);
      }
      const t = await fetchTimetables(res.student?.class || 'Class 02');
      if (t.schedule) setWeeklySchedule(t.schedule);
    } catch (err) {
      console.error('Error fetching parent student data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

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
      await changePassword(session.user.id, verifyPassword, newPassword);
      setProfileNotice({ type: 'success', text: 'Parent account password successfully updated.' });
      setVerifyPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setProfileNotice({ type: 'error', text: err.message || 'Failed to change password' });
    }
  };

  const handleUpdateLoginId = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);

    try {
      const res = await changeLoginId(session.user.id, parentLoginIdInput, verifyPassword);
      setProfileNotice({ type: 'success', text: `Parent Login ID updated to '${res.newLoginId}'. Note: Official Admission ID ${selectedStudentId} is permanent.` });
      onUpdateSessionUser({ ...session.user, loginId: res.newLoginId });
    } catch (err: any) {
      setProfileNotice({ type: 'error', text: err.message || 'Failed to update Login ID' });
    }
  };

  if (isLoading || !studentData) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-stone-600">Retrieving student records...</p>
        </div>
      </div>
    );
  }

  const { student, stats, attendanceLogs, ceRecords, examReports, notices } = studentData;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-16">
      
      {/* Header matching prompt layout */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-academy text-xl sm:text-2xl font-bold tracking-tight text-amber-200">
                Darussalam Academy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-700 text-white">
                NANDI • PARENT PORTAL
              </span>
            </div>
            <p className="text-xs text-emerald-300 font-medium tracking-wide mt-0.5">
              Secure parent monitoring workspace • Authorized student records
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Multi-student selector if parent has multiple children */}
            {linkedStudentIds.length > 1 && (
              <div className="flex items-center gap-2 bg-emerald-900 px-3 py-1 rounded-xl border border-emerald-800 text-xs">
                <span className="text-emerald-300 font-medium">Child:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-emerald-950 text-white font-bold rounded px-2 py-0.5"
                >
                  {linkedStudentIds.map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
            )}

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
        
        {/* STUDENT PROFILE CARD matching prompt */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center font-serif-academy text-xl font-bold shadow-md">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  STUDENT PROFILE
                </span>
                <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  Read-only access
                </span>
              </div>
              <h1 className="font-serif-academy text-2xl font-bold text-stone-900 mt-1">
                {student.name}
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                <span className="font-semibold text-emerald-950">{student.class} • {student.admissionId}</span> • Academic Year {student.academicYear} • Roll: {student.rollNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>Print Official Card</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation matching prompt */}
        <div className="bg-white rounded-2xl border border-stone-200 p-2 mb-6 shadow-xs no-print">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
              { id: 'ce', label: 'CE Work', icon: BookOpen },
              { id: 'exams', label: 'Exam Results', icon: Award },
              { id: 'progress', label: 'Progress', icon: FileText },
              { id: 'timetable', label: 'Timetable', icon: Clock },
              { id: 'notices', label: 'Notices', icon: Calendar },
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
                      ? 'bg-amber-700 text-white shadow-xs'
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
        {/* TAB 1: OVERVIEW (Matches prompt screenshot exactly) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="mb-6">
                <h2 className="font-serif-academy text-2xl font-bold text-stone-900">
                  Student Overview
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Your child's academic information in one place.
                </p>
              </div>

              {/* 4 Big Metrics matching prompt */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Attendance */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center">
                  <span className="font-serif-academy text-3xl sm:text-4xl font-extrabold text-emerald-950 block">
                    {stats.attendancePercentage}%
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 mt-1 block">
                    Attendance
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5 font-mono">
                    {stats.presentPeriods} of {stats.totalTrackedPeriods} periods attended
                  </span>
                </div>

                {/* Average Marks */}
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center">
                  <span className="font-serif-academy text-3xl sm:text-4xl font-extrabold text-amber-950 block">
                    {stats.averageMarks !== null ? `${stats.averageMarks}%` : '—'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 mt-1 block">
                    Average Marks
                  </span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">
                    {stats.averageMarks !== null ? 'Published Exam Score' : 'Awaiting publication'}
                  </span>
                </div>

                {/* CE Performance */}
                <div className="p-5 rounded-2xl bg-stone-100/70 border border-stone-200 text-center">
                  <span className="font-serif-academy text-3xl sm:text-4xl font-extrabold text-stone-900 block">
                    {stats.ceAverage !== null ? `${stats.ceAverage}/20` : '—'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 mt-1 block">
                    CE Performance
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    Continuous Evaluation average
                  </span>
                </div>

                {/* Overall Grade */}
                <div className="p-5 rounded-2xl bg-emerald-900 text-white text-center shadow-xs">
                  <span className="font-serif-academy text-3xl sm:text-4xl font-extrabold text-amber-300 block">
                    {stats.overallGrade || '—'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-100 mt-1 block">
                    Overall Grade
                  </span>
                  <span className="text-[10px] text-emerald-300 block mt-0.5">
                    Cumulative standing
                  </span>
                </div>

              </div>

              {/* Academic Summary matching prompt */}
              <div className="mt-8 p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                    Academic Summary
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Abdul Hadi C is demonstrating commendable diligence across both foundational Islamic studies (Arabic and Fiqh) and state syllabus curricula. Attendance is regular, and CE homework submissions remain on schedule.
                </p>
              </div>

              {/* Quick Access Cards matching prompt */}
              <div className="mt-8">
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-3">
                  Quick Access
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="p-4 rounded-xl bg-white border border-stone-200 hover:border-emerald-600 hover:shadow-xs transition-all text-left flex items-start justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-emerald-950 group-hover:text-emerald-800">
                        View Attendance
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Period-wise history and percentages
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('exams')}
                    className="p-4 rounded-xl bg-white border border-stone-200 hover:border-amber-600 hover:shadow-xs transition-all text-left flex items-start justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-amber-950 group-hover:text-amber-800">
                        Examination Report
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Subject-wise marks, grades and results
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('ce')}
                    className="p-4 rounded-xl bg-white border border-stone-200 hover:border-stone-500 hover:shadow-xs transition-all text-left flex items-start justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">
                        Continuous Evaluation
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Assignment submission and performance
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: DETAILED ATTENDANCE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div>
                <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                  Period-by-Period Attendance Register
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Calculation rule: Medical leaves are {stats.medicalRule === 'excluded' ? 'excluded from the percentage denominator' : stats.medicalRule}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold">
                  Overall: {stats.attendancePercentage}%
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-y border-stone-200">
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Date</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Period</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Subject</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Attendance Status</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-stone-400">
                        No period logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-stone-800">
                          {log.date}
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-600">
                          {log.period}
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {log.subject}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            log.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'medical'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-600 italic">
                          {log.remarks || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: CE WORK (Continuous Evaluation) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ce' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                Continuous Evaluation (CE Work)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Breakdown of assignment diligence (out of 15) and daily class performance (out of 5).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ceRecords.map(ce => (
                <div key={ce.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{ce.subject}</h4>
                      <p className="text-[10px] text-stone-500 font-mono">{ce.term}</p>
                    </div>
                    <span className="font-serif-academy text-lg font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-lg">
                      {ce.totalCE} / 20
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Assignment</span>
                      <span className="font-bold text-stone-800">{ce.assignmentMarks} / 15</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Class Participation</span>
                      <span className="font-bold text-stone-800">{ce.performanceMarks} / 5</span>
                    </div>
                  </div>

                  {ce.teacherRemarks && (
                    <p className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200 italic">
                      Teacher remark: "{ce.teacherRemarks}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: EXAMINATION RESULTS & REPORT CARD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            
            {/* Loop through each term */}
            {Object.entries(examReports).map(([termName, termData]) => (
              <div key={termName} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Official Examination Record
                    </span>
                    <h2 className="font-serif-academy text-xl sm:text-2xl font-bold text-emerald-950 mt-1">
                      {termName}
                    </h2>
                  </div>

                  <div>
                    {termData.isPublished ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Authorized & Published by Administration</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting Official Publication</span>
                      </span>
                    )}
                  </div>
                </div>

                {!termData.isPublished ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
                    <Clock className="w-8 h-8 text-stone-400 mx-auto" />
                    <h4 className="font-bold text-sm text-stone-800">
                      Results Withheld for Administrative Verification
                    </h4>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      Examination marks for {termName} will become visible here as soon as the Academy Administrator completes grading audits and authorizes publication.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-stone-100 text-stone-700 border-y border-stone-200">
                            <th className="py-3 px-4 font-bold uppercase text-[11px]">Subject</th>
                            <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">Theory (/80)</th>
                            <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">CE (/20)</th>
                            <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">Approved Grace</th>
                            <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">Final (/100)</th>
                            <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">Grade</th>
                            <th className="py-3 px-4 font-bold uppercase text-[11px]">Teacher Evaluation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {termData.records.map(r => (
                            <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                              <td className="py-3 px-4 font-bold text-stone-900">
                                {r.subject}
                              </td>
                              <td className="py-3 px-4 text-center font-medium">
                                {r.isAbsent ? 'AB' : r.theoryMarks}
                              </td>
                              <td className="py-3 px-4 text-center font-medium">
                                {r.ceMarks}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {r.graceMarks > 0 ? (
                                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    +{r.graceMarks}
                                  </span>
                                ) : (
                                  <span className="text-stone-300">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-bold text-sm text-emerald-950">
                                  {r.isAbsent ? 'AB' : r.totalMarks}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                                  {r.grade}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-stone-600 italic">
                                {r.teacherRemarks || 'Satisfactory'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 bg-emerald-950 text-white rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-amber-200">Darussalam Academy Examination Board</p>
                        <p className="text-[11px] text-emerald-300">Certified Authentic Student Record</p>
                      </div>
                      <button
                        onClick={handlePrintReport}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-2xs"
                      >
                        Download Result Card
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: PROGRESS OVER TIME */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'progress' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                Academic Progress & Continuous Growth
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Multi-faceted appraisal across Islamic disciplines, modern academics, and character formation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Spiritual & Hifz Progress
                </span>
                <h4 className="font-bold text-sm text-stone-900">Quranic Recitation & Tajweed</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Clear pronunciation of Arabic phonemes (Makhaarij), accurate application of Ghunnah and Madd rules during morning halaqah sessions.
                </p>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-700 h-full w-[94%]" />
                </div>
                <span className="text-[11px] font-mono text-stone-500 block text-right">94% Mastery</span>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Analytical & Mathematics
                </span>
                <h4 className="font-bold text-sm text-stone-900">Numerical & Problem Solving</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Excels in mental math speed drills, geometry shapes, and daily written assignments.
                </p>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full w-[96%]" />
                </div>
                <span className="text-[11px] font-mono text-stone-500 block text-right">96% Score</span>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-800 bg-stone-200 px-2 py-0.5 rounded">
                  Moral Conduct (Adab)
                </span>
                <h4 className="font-bold text-sm text-stone-900">Behavioral & Social Demeanor</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Respectful to teachers and peers; maintains clean study space and punctuality in communal prayers.
                </p>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-900 h-full w-[98%]" />
                </div>
                <span className="text-[11px] font-mono text-stone-500 block text-right">Exemplary</span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: TIMETABLE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'timetable' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                Class Timetable — {student.class}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Official daily schedule of classes, prayers, and breaks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(weeklySchedule).map(([day, slots]) => (
                <div key={day} className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
                  <div className="bg-amber-800 text-white py-2.5 px-4 font-bold text-xs uppercase tracking-wider">
                    {day}
                  </div>
                  <div className="p-3 space-y-2">
                    {slots.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                          <span>{s.period}</span>
                          <span>{s.timeRange}</span>
                        </div>
                        <p className="font-bold text-stone-900 mt-1">{s.subject}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{s.teacherName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 7: NOTICES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'notices' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif-academy text-2xl font-bold text-emerald-950">
                Academy Notices & Circulars
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Important announcements from Darussalam Academy administration.
              </p>
            </div>

            <div className="space-y-4">
              {notices.map((n: any) => (
                <div key={n.id} className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-mono">{n.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-200 font-bold uppercase text-[10px]">
                      {n.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">{n.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 8: MY PROFILE & CREDENTIALS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="font-serif-academy text-lg font-bold text-emerald-950">
                Parent Login ID
              </h3>
              <p className="text-xs text-stone-500">
                You may update your custom login handle. The official Student ID (<span className="font-mono font-bold">{selectedStudentId}</span>) remains unchanged in academy records.
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
                  <label className="block font-bold text-stone-700 uppercase mb-1">Parent Login ID</label>
                  <input
                    type="text"
                    required
                    value={parentLoginIdInput}
                    onChange={(e) => setParentLoginIdInput(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Verify Password</label>
                  <input
                    type="password"
                    required
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    placeholder="Verify identity"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition-colors"
                >
                  Save Login ID
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="font-serif-academy text-lg font-bold text-emerald-950">
                Update Parent Password
              </h3>
              <p className="text-xs text-stone-500">
                Set a private, confidential password known only to you.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
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
                  className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-200 font-bold transition-colors"
                >
                  Change Password
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
