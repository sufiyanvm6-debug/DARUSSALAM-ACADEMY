import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings, 
  Globe, 
  Users, 
  GraduationCap, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Eye, 
  Key, 
  UserX, 
  UserCheck, 
  History, 
  Sparkles, 
  Sliders, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Check,
  X
} from 'lucide-react';
import { 
  AuthSession, 
  CMSContent, 
  UserAccount, 
  StudentRecord, 
  GraceMarkRequest, 
  AuditLogEntry, 
  AcademicSettings,
  LeaveRequest 
} from '../../types/academy';
import { 
  fetchAdminCMS, 
  saveCMSDraft, 
  publishCMS, 
  restoreCMSRevision, 
  fetchAdminUsers, 
  createAccount, 
  resetUserPassword, 
  toggleUserStatus, 
  linkStudentsToParent, 
  fetchAcademicMeta, 
  updateAcademicSettings, 
  fetchGraceRequests, 
  decideGraceMarks, 
  fetchAuditLogs, 
  fetchLeaves, 
  decideLeave, 
  resetSampleData 
} from '../../services/api';

interface AdminDashboardProps {
  session: AuthSession;
  onLogout: () => void;
  onPreviewPublicDraft?: (draftContent: CMSContent) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  onLogout,
  onPreviewPublicDraft
}) => {
  const [activeTab, setActiveTab] = useState<'cms' | 'accounts' | 'academic' | 'audit'>('accounts');

  // CMS state
  const [cmsDraft, setCmsDraft] = useState<CMSContent | null>(null);
  const [cmsPublished, setCmsPublished] = useState<CMSContent | null>(null);
  const [cmsRevisions, setCmsRevisions] = useState<any[]>([]);
  const [cmsSubTab, setCmsSubTab] = useState<'identity' | 'cover' | 'programs' | 'achievements' | 'faculty' | 'about' | 'contact' | 'appearance'>('identity');
  const [cmsNotice, setCmsNotice] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Accounts state
  const [userRoleFilter, setUserRoleFilter] = useState<'teacher' | 'parent'>('teacher');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<StudentRecord[]>([]);
  const [accountNotice, setAccountNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create User Form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserLoginId, setNewUserLoginId] = useState('');
  const [newUserInitialPassword, setNewUserInitialPassword] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newParentLinkedIds, setNewParentLinkedIds] = useState<string[]>(['JM156']);

  // Reset Password Modal
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [tempPasswordInput, setTempPasswordInput] = useState('');

  // Link Student Modal
  const [linkStudentUser, setLinkStudentUser] = useState<any | null>(null);
  const [selectedStudentIdsToLink, setSelectedStudentIdsToLink] = useState<string[]>([]);

  // Academic & Evaluation Rules state
  const [academicSettings, setAcademicSettings] = useState<AcademicSettings>({
    medicalAttendanceRule: 'excluded',
    examPublishedTerms: { 'Midterm 2026–27': true, 'Annual Examination 2026-27': false },
    minPassPercentage: 40,
    maxGraceMarksPerStudent: 5
  });
  const [graceRequests, setGraceRequests] = useState<GraceMarkRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [academicNotice, setAcademicNotice] = useState<string | null>(null);

  // Audit Log state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    loadCMS();
    loadAccounts();
    loadAcademicData();
    loadAuditTrail();
  }, []);

  const loadCMS = async () => {
    try {
      const data = await fetchAdminCMS();
      if (data.draft) setCmsDraft(data.draft);
      if (data.published) setCmsPublished(data.published);
      if (data.revisions) setCmsRevisions(data.revisions);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAccounts = async () => {
    try {
      const res = await fetchAdminUsers();
      if (res.users) setUsersList(res.users);
      if (res.students) setStudentsList(res.students);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAcademicData = async () => {
    try {
      const meta = await fetchAcademicMeta();
      if (meta.settings) setAcademicSettings(meta.settings);
      const gr = await fetchGraceRequests();
      if (gr.requests) setGraceRequests(gr.requests);
      const lv = await fetchLeaves();
      if (lv.requests) setLeaveRequests(lv.requests);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const res = await fetchAuditLogs();
      if (res.logs) setAuditLogs(res.logs);
    } catch (e) {
      console.error(e);
    }
  };

  // CMS Handlers
  const handleSaveCMSDraft = async () => {
    if (!cmsDraft) return;
    try {
      await saveCMSDraft(cmsDraft, session.user.name);
      setCmsNotice('Homepage draft saved. You can preview changes before publishing.');
      setTimeout(() => setCmsNotice(null), 3500);
      loadCMS();
    } catch (err: any) {
      alert(err.message || 'Error saving CMS draft');
    }
  };

  const handlePublishCMS = async () => {
    try {
      await publishCMS(session.user.name);
      setCmsNotice('Website published! Public homepage is now synchronized with current updates.');
      setTimeout(() => setCmsNotice(null), 4000);
      loadCMS();
      loadAuditTrail();
    } catch (err: any) {
      alert(err.message || 'Error publishing CMS');
    }
  };

  const handleRestoreRevision = async (revId: string) => {
    if (!confirm('Are you sure you want to restore this previous revision of the homepage?')) return;
    try {
      await restoreCMSRevision(revId, session.user.name);
      setCmsNotice('Restored homepage to previous saved snapshot.');
      setTimeout(() => setCmsNotice(null), 3500);
      loadCMS();
      loadAuditTrail();
    } catch (err: any) {
      alert(err.message || 'Error restoring revision');
    }
  };

  // Account Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountNotice(null);

    const payload: any = {
      role: userRoleFilter,
      name: newUserName,
      loginId: newUserLoginId,
      initialPassword: newUserInitialPassword,
      phone: newUserPhone,
      email: newUserEmail,
      actorName: session.user.name
    };

    if (userRoleFilter === 'parent') {
      payload.parentDetails = {
        linkedStudentIds: newParentLinkedIds,
        parentRelation: 'Parent / Guardian'
      };
    } else {
      payload.teacherDetails = {
        assignedClasses: ['Class 02'],
        assignedSubjects: ['Arabic Language']
      };
    }

    try {
      const res = await createAccount(payload);
      setAccountNotice({ type: 'success', text: res.message });
      setNewUserName('');
      setNewUserLoginId('');
      setNewUserInitialPassword('');
      setNewUserPhone('');
      setNewUserEmail('');
      loadAccounts();
      loadAuditTrail();
    } catch (err: any) {
      setAccountNotice({ type: 'error', text: err.message || 'Failed to create account' });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await toggleUserStatus(userId, session.user.name);
      setAccountNotice({ type: 'success', text: res.message });
      loadAccounts();
      loadAuditTrail();
    } catch (err: any) {
      setAccountNotice({ type: 'error', text: err.message || 'Failed to update status' });
    }
  };

  const handleResetPassword = async () => {
    if (!resetModalUser || !tempPasswordInput) return;
    try {
      const res = await resetUserPassword(resetModalUser.id, tempPasswordInput, session.user.name);
      setAccountNotice({ type: 'success', text: res.message });
      setResetModalUser(null);
      setTempPasswordInput('');
      loadAccounts();
      loadAuditTrail();
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleSaveLinkedStudents = async () => {
    if (!linkStudentUser) return;
    try {
      await linkStudentsToParent(linkStudentUser.id, selectedStudentIdsToLink, session.user.name);
      setAccountNotice({ type: 'success', text: 'Linked students updated for parent account.' });
      setLinkStudentUser(null);
      loadAccounts();
      loadAuditTrail();
    } catch (err: any) {
      alert(err.message || 'Failed to link students');
    }
  };

  // Academic Settings
  const handleSaveAcademicSettings = async (newSettings: Partial<AcademicSettings>) => {
    try {
      const res = await updateAcademicSettings(newSettings, session.user.name);
      setAcademicSettings(res.settings);
      setAcademicNotice('Academic rules & publication settings successfully saved.');
      setTimeout(() => setAcademicNotice(null), 3500);
      loadAuditTrail();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  // Grace Mark Decision
  const handleDecideGrace = async (requestId: string, status: 'approved' | 'rejected' | 'modified', grace: number) => {
    const remarks = prompt(`Enter administrative remark for ${status} decision:`) || '';
    try {
      await decideGraceMarks({
        requestId,
        status,
        approvedGrace: grace,
        adminRemarks: remarks,
        adminName: session.user.name
      });
      loadAcademicData();
      loadAuditTrail();
    } catch (err: any) {
      alert(err.message || 'Failed to update grace request');
    }
  };

  // Leave Decision
  const handleDecideLeave = async (leaveId: string, status: 'approved' | 'rejected') => {
    const substitute = prompt('Enter assigned substitute teacher:') || 'Usthad Kabeer Nandi';
    try {
      await decideLeave({
        leaveId,
        status,
        assignedSubstitute: substitute,
        adminName: session.user.name
      });
      loadAcademicData();
      loadAuditTrail();
    } catch (err: any) {
      alert(err.message || 'Failed to decide leave');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-16">
      
      {/* Top Admin Header */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-academy text-xl sm:text-2xl font-bold tracking-tight text-amber-200">
                Darussalam Academy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-800 text-emerald-200">
                ADMINISTRATIVE CONTROL PANEL
              </span>
            </div>
            <p className="text-xs text-stone-400 font-medium tracking-wide mt-0.5">
              Centralized CMS, Security, Academic Regulations & Audit History
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-300 font-mono bg-stone-800 px-3 py-1 rounded-lg">
              Administrator: {session.user.name}
            </span>
            <button
              onClick={onLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-stone-200 p-2 mb-6 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'accounts', label: 'Account Management', icon: Users, desc: 'Teachers & Parents' },
              { id: 'cms', label: 'Homepage CMS', icon: Globe, desc: 'Public website controls' },
              { id: 'academic', label: 'Academic & Exams', icon: Sliders, desc: 'Medical rule, Grace & Publication' },
              { id: 'audit', label: 'Audit Trail', icon: History, desc: 'Immutable security log' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <span>{tab.label}</span>
                    <span className="block text-[10px] opacity-70 font-normal">{tab.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: ACCOUNT MANAGEMENT (Matches Prompt Mockup) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            
            {/* Header matching prompt */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Admin only
                    </span>
                    <span className="text-xs text-stone-400">Account Management</span>
                  </div>
                  <h2 className="font-serif-academy text-2xl font-bold text-stone-900 mt-1">
                    Faculty & Parent Credential Administration
                  </h2>
                </div>

                {/* Sub-selector for Teachers / Parents matching prompt */}
                <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    onClick={() => setUserRoleFilter('teacher')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      userRoleFilter === 'teacher'
                        ? 'bg-emerald-900 text-amber-200 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Teachers</span>
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('parent')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      userRoleFilter === 'parent'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Parents</span>
                  </button>
                </div>
              </div>

              {accountNotice && (
                <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  accountNotice.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{accountNotice.text}</span>
                </div>
              )}

              {/* Grid: Create Account on Left, List on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                
                {/* Create Form matching prompt */}
                <div className="lg:col-span-4 bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                    Create New {userRoleFilter === 'teacher' ? 'Teacher' : 'Parent'} Account
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Accounts are issued with a temporary password that the user must change on initial login.
                  </p>

                  <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">
                        {userRoleFilter === 'teacher' ? 'Teacher Full Name' : 'Parent / Guardian Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder={userRoleFilter === 'teacher' ? 'e.g. Usthad K.V. Faizy' : 'e.g. Chekku Haji'}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">
                        {userRoleFilter === 'teacher' ? 'Teacher Login ID' : 'Parent Login ID'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newUserLoginId}
                        onChange={(e) => setNewUserLoginId(e.target.value)}
                        placeholder={userRoleFilter === 'teacher' ? 'e.g. teacher_faizy' : 'e.g. parent_jm156'}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    {userRoleFilter === 'parent' && (
                      <div>
                        <label className="block font-bold text-stone-700 uppercase mb-1">
                          Linked Student ID(s)
                        </label>
                        <select
                          multiple
                          value={newParentLinkedIds}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                            setNewParentLinkedIds(selected);
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs h-20"
                        >
                          {studentsList.map(s => (
                            <option key={s.admissionId} value={s.admissionId}>
                              {s.name} ({s.admissionId} - {s.class})
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-stone-400 block mt-1">Hold Ctrl/Cmd to select multiple children</span>
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">
                        Initial Temporary Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newUserInitialPassword}
                        onChange={(e) => setNewUserInitialPassword(e.target.value)}
                        placeholder="Temporary password"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="+91 98471 •••••"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-amber-200 font-bold transition-all shadow-xs"
                    >
                      Create Account
                    </button>
                  </form>
                </div>

                {/* Account Administration Table matching prompt */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                      Account Administration ({usersList.filter(u => u.role === userRoleFilter).length} {userRoleFilter}s)
                    </h3>
                    <span className="text-[11px] text-stone-500">Security Rule: Passwords hashed with PBKDF2</span>
                  </div>

                  <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                          <th className="py-3 px-4 font-bold uppercase text-[11px]">User Details</th>
                          <th className="py-3 px-4 font-bold uppercase text-[11px]">Login ID</th>
                          <th className="py-3 px-4 font-bold uppercase text-[11px]">Status</th>
                          <th className="py-3 px-4 font-bold uppercase text-[11px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {usersList
                          .filter(u => u.role === userRoleFilter)
                          .map(u => (
                            <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                              <td className="py-3 px-4">
                                <span className="font-bold text-stone-900 block">{u.name}</span>
                                <span className="text-[11px] text-stone-500">
                                  {u.phone || 'No phone'} • Created: {new Date(u.createdAt).toLocaleDateString()}
                                </span>
                                {u.role === 'parent' && u.parentProfile?.linkedStudentIds && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {u.parentProfile.linkedStudentIds.map((sid: string) => (
                                      <span key={sid} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-mono">
                                        Child: {sid}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4 font-mono font-bold text-stone-700">
                                {u.loginId}
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  u.disabled ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {u.disabled ? 'Disabled' : 'Active'}
                                </span>
                                {u.mustChangePassword && (
                                  <span className="block text-[9px] text-amber-700 mt-0.5">Temp Pass Active</span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right space-x-1.5">
                                <button
                                  onClick={() => {
                                    setResetModalUser(u);
                                    setTempPasswordInput('academy2026');
                                  }}
                                  title="Reset password"
                                  className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold border border-stone-300"
                                >
                                  Reset Pass
                                </button>

                                {u.role === 'parent' && (
                                  <button
                                    onClick={() => {
                                      setLinkStudentUser(u);
                                      setSelectedStudentIdsToLink(u.parentProfile?.linkedStudentIds || []);
                                    }}
                                    className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200"
                                  >
                                    Link Kids
                                  </button>
                                )}

                                <button
                                  onClick={() => handleToggleStatus(u.id)}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold ${
                                    u.disabled
                                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                                  }`}
                                >
                                  {u.disabled ? 'Enable' : 'Disable'}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>

            {/* Reset Password Modal */}
            {resetModalUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 shadow-2xl p-6 w-full max-w-md">
                  <h3 className="font-serif-academy text-lg font-bold text-stone-900 mb-1">
                    Assign Temporary Password
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    Target account: <span className="font-bold text-stone-800">{resetModalUser.name}</span> ({resetModalUser.loginId}). The user will be forced to change this upon logging in.
                  </p>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">
                        New Temporary Password
                      </label>
                      <input
                        type="text"
                        value={tempPasswordInput}
                        onChange={(e) => setTempPasswordInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-mono"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setResetModalUser(null)}
                        className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="px-5 py-2 bg-stone-900 text-amber-200 font-bold rounded-xl shadow-xs"
                      >
                        Reset & Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Link Students Modal */}
            {linkStudentUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 shadow-2xl p-6 w-full max-w-md">
                  <h3 className="font-serif-academy text-lg font-bold text-stone-900 mb-1">
                    Link Students to Parent Account
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    Select students associated with {linkStudentUser.name}.
                  </p>

                  <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
                    {studentsList.map(st => {
                      const isSelected = selectedStudentIdsToLink.includes(st.admissionId);
                      return (
                        <div
                          key={st.admissionId}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStudentIdsToLink(prev => prev.filter(id => id !== st.admissionId));
                            } else {
                              setSelectedStudentIdsToLink(prev => [...prev, st.admissionId]);
                            }
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold' : 'bg-white border-stone-200'
                          }`}
                        >
                          <div>
                            <span>{st.name}</span>
                            <span className="block text-[11px] font-mono text-stone-500">{st.admissionId} • {st.class}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-700" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setLinkStudentUser(null)}
                      className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLinkedStudents}
                      className="px-5 py-2 bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      Save Linked Students
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: HOMEPAGE CMS MANAGER (Matches Prompt Specification Table) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'cms' && cmsDraft && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-serif-academy text-2xl font-bold text-stone-900">
                  Homepage Content Management System (CMS)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Update public academy identity, campus photos, faculty rosters, programs, and section visibility.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCMSDraft}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300"
                >
                  Save Draft
                </button>

                <button
                  onClick={handlePublishCMS}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-200 shadow-sm flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Publish to Public Site</span>
                </button>
              </div>
            </div>

            {cmsNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{cmsNotice}</span>
              </div>
            )}

            {/* CMS Section Tabs matching prompt specification */}
            <div className="flex flex-wrap border-b border-stone-200 text-xs font-bold text-stone-600 gap-1 pb-2">
              {[
                { id: 'identity', label: 'Academy Identity' },
                { id: 'cover', label: 'Campus Cover' },
                { id: 'programs', label: 'Programs' },
                { id: 'achievements', label: 'Achievements' },
                { id: 'faculty', label: 'Faculty' },
                { id: 'about', label: 'About Us' },
                { id: 'contact', label: 'Contact Us' },
                { id: 'appearance', label: 'Appearance & Sections' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setCmsSubTab(s.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    cmsSubTab === s.id
                      ? 'bg-emerald-900 text-amber-200 shadow-xs'
                      : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* CMS Sub-Forms */}
            {cmsSubTab === 'identity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Academy Name</label>
                  <input
                    type="text"
                    value={cmsDraft.identity.academyName}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, identity: { ...cmsDraft.identity, academyName: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Subtitle / Location</label>
                  <input
                    type="text"
                    value={cmsDraft.identity.subtitle}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, identity: { ...cmsDraft.identity, subtitle: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Motto</label>
                  <input
                    type="text"
                    value={cmsDraft.identity.motto}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, identity: { ...cmsDraft.identity, motto: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Established Year</label>
                  <input
                    type="text"
                    value={cmsDraft.identity.establishedYear}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, identity: { ...cmsDraft.identity, establishedYear: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>
            )}

            {cmsSubTab === 'cover' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Hero Main Title</label>
                  <input
                    type="text"
                    value={cmsDraft.campusCover.heroTitle}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, campusCover: { ...cmsDraft.campusCover, heroTitle: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Hero Description</label>
                  <textarea
                    rows={2}
                    value={cmsDraft.campusCover.heroDescription}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, campusCover: { ...cmsDraft.campusCover, heroDescription: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Main Cover Photo URL</label>
                  <input
                    type="text"
                    value={cmsDraft.campusCover.coverImageUrl}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, campusCover: { ...cmsDraft.campusCover, coverImageUrl: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-900"
                  />
                </div>
              </div>
            )}

            {cmsSubTab === 'programs' && (
              <div className="space-y-4 text-xs">
                {cmsDraft.programs.map((prog, idx) => (
                  <div key={prog.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800">Program #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = cmsDraft.programs.filter(p => p.id !== prog.id);
                          setCmsDraft({ ...cmsDraft, programs: updated });
                        }}
                        className="text-rose-600 hover:text-rose-800 text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-600 mb-1">Title</label>
                        <input
                          type="text"
                          value={prog.title}
                          onChange={(e) => {
                            const copy = [...cmsDraft.programs];
                            copy[idx].title = e.target.value;
                            setCmsDraft({ ...cmsDraft, programs: copy });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-600 mb-1">Duration</label>
                        <input
                          type="text"
                          value={prog.duration}
                          onChange={(e) => {
                            const copy = [...cmsDraft.programs];
                            copy[idx].duration = e.target.value;
                            setCmsDraft({ ...cmsDraft, programs: copy });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cmsSubTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={cmsDraft.contactUs.addressLine1}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, contactUs: { ...cmsDraft.contactUs, addressLine1: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={cmsDraft.contactUs.phonePrimary}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, contactUs: { ...cmsDraft.contactUs, phonePrimary: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Official Email</label>
                  <input
                    type="text"
                    value={cmsDraft.contactUs.emailOfficial}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, contactUs: { ...cmsDraft.contactUs, emailOfficial: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={cmsDraft.contactUs.workingHours}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, contactUs: { ...cmsDraft.contactUs, workingHours: e.target.value } })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {cmsSubTab === 'appearance' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-stone-700">Section Visibility</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'showPrograms', label: 'Programs Section' },
                    { key: 'showAchievements', label: 'Achievements Section' },
                    { key: 'showFaculty', label: 'Faculty Scholars' },
                    { key: 'showAbout', label: 'About Us Heritage' },
                    { key: 'showContact', label: 'Contact Section' },
                    { key: 'showAnnouncements', label: 'Notices Board' }
                  ].map(sec => (
                    <label key={sec.key} className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(cmsDraft.appearance as any)[sec.key]}
                        onChange={(e) => {
                          setCmsDraft({
                            ...cmsDraft,
                            appearance: {
                              ...cmsDraft.appearance,
                              [sec.key]: e.target.checked
                            }
                          });
                        }}
                        className="rounded text-emerald-800"
                      />
                      <span className="font-bold text-stone-800">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Revisions & Rollback */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-stone-500" />
                Restore Previous Content Revisions
              </h4>
              <div className="space-y-2">
                {cmsRevisions.map(rev => (
                  <div key={rev.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-stone-800">Snapshot {rev.id}</span>
                      <span className="text-[11px] text-stone-500 block">Published by {rev.publishedBy} on {new Date(rev.timestamp).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreRevision(rev.id)}
                      className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg text-[11px]"
                    >
                      Rollback to this
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ACADEMIC & EXAMS (Medical Rule, Grace & Publication) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            
            {/* Calculation Rules matching prompt specifications */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div>
                <h2 className="font-serif-academy text-2xl font-bold text-stone-900">
                  Academic Regulations & Attendance Calculation Rules
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  The administrator must define whether Medical counts as present, absent, or separately excluded from the percentage denominator.
                </p>
              </div>

              {academicNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{academicNotice}</span>
                </div>
              )}

              {/* Medical Attendance Rule Selector */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950">
                  Medical Attendance Rule Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { id: 'excluded', label: 'Excluded from Denominator', desc: 'Recommended: Does not penalize student, excluded from total days' },
                    { id: 'present', label: 'Counted as Present', desc: 'Medical note grants full attendance credit' },
                    { id: 'absent', label: 'Counted as Absent', desc: 'Marked on record as absence with medical notation' }
                  ].map(rule => (
                    <label
                      key={rule.id}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        academicSettings.medicalAttendanceRule === rule.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="medicalRule"
                          value={rule.id}
                          checked={academicSettings.medicalAttendanceRule === rule.id}
                          onChange={() => handleSaveAcademicSettings({ medicalAttendanceRule: rule.id as any })}
                          className="text-emerald-800"
                        />
                        <span>{rule.label}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-normal mt-1 pl-5">{rule.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Examination Result Publication Switch matching prompt */}
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-950">
                      Authorized Result Publication Control
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Teachers can preview results before publishing, while parents can view them only after authorized administrative publication.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {['Midterm 2026–27', 'Annual Examination 2026-27'].map(term => {
                    const isPublished = Boolean(academicSettings.examPublishedTerms[term]);
                    return (
                      <div key={term} className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-stone-900 block">{term}</span>
                          <span className="text-[11px] text-stone-500">
                            {isPublished ? 'Visible to all Parents' : 'Withheld (Draft/Review)'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = {
                              ...academicSettings.examPublishedTerms,
                              [term]: !isPublished
                            };
                            handleSaveAcademicSettings({ examPublishedTerms: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          {isPublished ? 'Published (Live)' : 'Withhold'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grace Mark Approval Queue matching prompt */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="font-serif-academy text-xl font-bold text-stone-900">
                  Grace Marks Approval Queue
                </h3>

                <div className="space-y-3">
                  {graceRequests.length === 0 ? (
                    <p className="text-xs text-stone-400 py-4 text-center">No grace mark requests pending.</p>
                  ) : (
                    graceRequests.map(gr => (
                      <div key={gr.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{gr.studentName}</span>
                            <span className="font-mono text-stone-500">({gr.studentId} • {gr.className})</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">{gr.subject}</span>
                          </div>
                          <p className="text-stone-600 mt-1">
                            Teacher request: <span className="font-bold text-amber-800">+{gr.requestedGrace} marks</span> by {gr.requestedByTeacherName}
                          </p>
                          <p className="text-stone-500 italic mt-0.5">"{gr.justification}"</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            gr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {gr.status}
                          </span>

                          {gr.status === 'pending' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDecideGrace(gr.id, 'approved', gr.requestedGrace)}
                                className="px-2.5 py-1 bg-emerald-700 text-white rounded font-bold hover:bg-emerald-800"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDecideGrace(gr.id, 'rejected', 0)}
                                className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Leave Requests Review Queue */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="font-serif-academy text-xl font-bold text-stone-900">
                  Teacher Leave & Substitution Review
                </h3>

                <div className="space-y-3">
                  {leaveRequests.map(lv => (
                    <div key={lv.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{lv.teacherName}</span>
                          <span className="text-stone-500 font-mono">({lv.startDate} to {lv.endDate} • {lv.totalDays} days)</span>
                        </div>
                        <p className="text-stone-600 mt-1">Reason: {lv.reason}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          lv.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {lv.status}
                        </span>

                        {lv.status === 'pending' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDecideLeave(lv.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-700 text-white rounded font-bold"
                            >
                              Sanction
                            </button>
                            <button
                              onClick={() => handleDecideLeave(lv.id, 'rejected')}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: AUDIT TRAIL (Permanent Security & Academic History) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-serif-academy text-2xl font-bold text-stone-900">
                  Permanent Security & Academic Audit Log
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  All credential changes, attendance commits, exam mark edits, grace mark approvals, and CMS publications are preserved in this immutable audit trail.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 w-48 focus:w-64 transition-all"
              />
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Timestamp</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Actor</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Category</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Action</th>
                    <th className="py-3 px-4 font-bold uppercase text-[11px]">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                  {auditLogs
                    .filter(l => 
                      !auditSearch || 
                      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      l.actorName.toLowerCase().includes(auditSearch.toLowerCase())
                    )
                    .map(log => (
                      <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-2.5 px-4 text-stone-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-stone-800 whitespace-nowrap">
                          {log.actorName} ({log.actorRole})
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded uppercase text-[9px] font-bold bg-stone-200 text-stone-800">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-emerald-950">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-4 text-stone-700 font-sans text-xs">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
