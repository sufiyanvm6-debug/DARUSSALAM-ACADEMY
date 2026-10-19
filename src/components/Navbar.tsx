import React, { useState } from 'react';
import { Shield, BookOpen, User, LogOut, Menu, X, Landmark, GraduationCap, Users } from 'lucide-react';
import { AuthSession, CMSContent } from '../types/academy';

interface NavbarProps {
  cms: CMSContent;
  session: AuthSession | null;
  currentView: 'public' | 'admin' | 'teacher' | 'parent';
  onNavigate: (view: 'public' | 'admin' | 'teacher' | 'parent') => void;
  onOpenLogin: (portal: 'admin' | 'teacher' | 'parent') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cms,
  session,
  currentView,
  onNavigate,
  onOpenLogin,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Identity */}
          <button
            onClick={() => onNavigate('public')}
            className="flex items-center gap-3.5 text-left group focus:outline-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 border border-emerald-800">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-academy text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors">
                  {cms.identity.academyName}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Nandi
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium tracking-wide">
                {cms.identity.subtitle}
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          {currentView === 'public' ? (
            <nav className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors">
                About Us
              </a>
              <a href="#programs" className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors">
                Programs
              </a>
              <a href="#achievements" className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors">
                Achievements
              </a>
              <a href="#faculty" className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors">
                Faculty
              </a>
              <a href="#contact" className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors">
                Contact
              </a>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => onNavigate('public')}
                className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-emerald-900 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 transition-colors"
              >
                ← Back to Public Website
              </button>
            </div>
          )}

          {/* Right Action / Portals */}
          <div className="hidden lg:flex items-center gap-2.5">
            {session ? (
              <div className="flex items-center gap-3 bg-stone-100/90 py-1.5 px-3 rounded-xl border border-stone-300/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-xs font-semibold text-stone-800">
                    {session.user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-900 text-amber-200">
                    {session.user.role}
                  </span>
                </div>

                {currentView === 'public' ? (
                  <button
                    onClick={() => onNavigate(session.user.role)}
                    className="text-xs font-medium text-emerald-800 hover:underline px-2 py-1 rounded bg-white shadow-2xs border border-stone-200"
                  >
                    Open Workspace →
                  </button>
                ) : null}

                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 text-stone-500 hover:text-rose-700 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Admin Portal Button */}
                <button
                  onClick={() => onOpenLogin('admin')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-stone-700 hover:text-emerald-950 hover:bg-emerald-50/60 border border-stone-300 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Admin Portal</span>
                </button>

                {/* Teachers' Portal Button */}
                <button
                  onClick={() => onOpenLogin('teacher')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-900 text-amber-200 hover:bg-emerald-950 shadow-xs hover:shadow transition-all"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Teachers' Portal</span>
                </button>

                {/* Parent Portal Button */}
                <button
                  onClick={() => onOpenLogin('parent')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-700 text-white hover:bg-amber-800 shadow-xs hover:shadow transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Parent Portal</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            {session && (
              <button
                onClick={() => onNavigate(session.user.role)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-900 text-amber-200"
              >
                {session.user.role.toUpperCase()}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-emerald-950 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FAF8F5] px-4 pt-4 pb-6 space-y-4 shadow-lg">
          <div className="grid grid-cols-1 gap-2 pb-3 border-b border-stone-200">
            <button
              onClick={() => { onNavigate('public'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg"
            >
              Public Homepage
            </button>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg"
            >
              About Us
            </a>
            <a
              href="#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg"
            >
              Programs
            </a>
            <a
              href="#faculty"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg"
            >
              Faculty
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg"
            >
              Contact
            </a>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-3">
              Secure Portals
            </p>
            <button
              onClick={() => { onOpenLogin('admin'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg bg-stone-100 text-stone-900 border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-800" />
                Admin Portal
              </span>
              <span className="text-xs text-stone-400">Manage</span>
            </button>
            <button
              onClick={() => { onOpenLogin('teacher'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg bg-emerald-900 text-amber-200"
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Teachers' Portal
              </span>
              <span className="text-xs text-amber-300/80">Academics</span>
            </button>
            <button
              onClick={() => { onOpenLogin('parent'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg bg-amber-700 text-white"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Parent Portal
              </span>
              <span className="text-xs text-amber-100/80">Student Progress</span>
            </button>

            {session && (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-rose-700 bg-rose-50 rounded-lg border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({session.user.loginId})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
