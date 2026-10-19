import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PublicHomepage } from './components/PublicHomepage';
import { LoginModal } from './components/LoginModal';
import { FirstLoginPasswordModal } from './components/FirstLoginPasswordModal';
import { TeacherDashboard } from './components/TeacherPortal/TeacherDashboard';
import { ParentDashboard } from './components/ParentPortal/ParentDashboard';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { CMSContent, AuthSession } from './types/academy';
import { fetchPublicCMS } from './services/api';

export default function App() {
  const [cms, setCms] = useState<CMSContent | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'teacher' | 'parent'>('public');
  
  // Login modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPortalTarget, setLoginPortalTarget] = useState<'admin' | 'teacher' | 'parent'>('parent');

  // Mandatory first login password change modal
  const [isFirstPasswordModalOpen, setIsFirstPasswordModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    // Load published CMS
    fetchPublicCMS()
      .then(data => setCms(data))
      .catch(err => console.error('Failed to load initial CMS', err));

    // Restore cached session if present
    const saved = localStorage.getItem('darussalam_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuthSession;
        setSession(parsed);
        if (parsed.user.mustChangePassword) {
          setIsFirstPasswordModalOpen(true);
        }
      } catch (e) {
        localStorage.removeItem('darussalam_session');
      }
    }
  }, []);

  const handleOpenLogin = (portal: 'admin' | 'teacher' | 'parent') => {
    setLoginPortalTarget(portal);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    localStorage.setItem('darussalam_session', JSON.stringify(newSession));

    if (newSession.user.mustChangePassword) {
      setIsFirstPasswordModalOpen(true);
    } else {
      setCurrentView(newSession.user.role);
    }
  };

  const handlePasswordUpdated = () => {
    if (session) {
      const updated = {
        ...session,
        user: { ...session.user, mustChangePassword: false }
      };
      setSession(updated);
      localStorage.setItem('darussalam_session', JSON.stringify(updated));
    }
    setIsFirstPasswordModalOpen(false);
    if (session) {
      setCurrentView(session.user.role);
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('darussalam_session');
    setCurrentView('public');
  };

  const handleUpdateSessionUser = (updatedUser: any) => {
    if (session) {
      const updated = { ...session, user: updatedUser };
      setSession(updated);
      localStorage.setItem('darussalam_session', JSON.stringify(updated));
    }
  };

  // Fallback while loading initial CMS
  if (!cms) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-900 border border-emerald-800 flex items-center justify-center text-amber-300 font-serif-academy text-2xl font-bold mb-4 shadow-lg animate-pulse">
          D
        </div>
        <h1 className="font-serif-academy text-xl font-bold text-emerald-950">
          Darussalam Academy
        </h1>
        <p className="text-xs text-stone-500 font-medium tracking-wide mt-1">
          Nandi, Kerala • Loading Academic Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col">
      
      {/* Global Navbar */}
      <Navbar
        cms={cms}
        session={session}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* Main View Display */}
      <main className="flex-1">
        {currentView === 'public' && (
          <PublicHomepage
            cms={cms}
            onOpenLogin={handleOpenLogin}
          />
        )}

        {currentView === 'teacher' && session && (
          <TeacherDashboard
            session={session}
            onLogout={handleLogout}
            onUpdateSessionUser={handleUpdateSessionUser}
          />
        )}

        {currentView === 'parent' && session && (
          <ParentDashboard
            session={session}
            onLogout={handleLogout}
            onUpdateSessionUser={handleUpdateSessionUser}
          />
        )}

        {currentView === 'admin' && session && (
          <AdminDashboard
            session={session}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialPortal={loginPortalTarget}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Mandatory First-Time Password Change Modal */}
      {session && (
        <FirstLoginPasswordModal
          isOpen={isFirstPasswordModalOpen}
          userId={session.user.id}
          userName={session.user.name}
          isMandatoryFirstLogin={session.user.mustChangePassword}
          onSuccess={handlePasswordUpdated}
          onCancel={session.user.mustChangePassword ? undefined : () => setIsFirstPasswordModalOpen(false)}
        />
      )}

    </div>
  );
}
