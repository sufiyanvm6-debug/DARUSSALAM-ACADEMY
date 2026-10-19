import React from 'react';
import { 
  Landmark, 
  BookOpen, 
  Award, 
  GraduationCap, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Calendar,
  Building,
  ChevronRight
} from 'lucide-react';
import { CMSContent } from '../types/academy';

interface PublicHomepageProps {
  cms: CMSContent;
  onOpenLogin: (portal: 'admin' | 'teacher' | 'parent') => void;
}

export const PublicHomepage: React.FC<PublicHomepageProps> = ({ cms, onOpenLogin }) => {
  const { identity, campusCover, aboutUs, contactUs, programs, achievements, faculty, notices, appearance } = cms;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 selection:bg-emerald-900 selection:text-amber-100">
      
      {/* Disclaimer Top Banner */}
      <div className="bg-emerald-950 text-amber-200/90 text-xs py-2 px-4 text-center border-b border-emerald-900/60 font-medium tracking-wide">
        <span>Homepage visual concept. Images are illustrative placeholders, not actual academy photographs.</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Introduction */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-950 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{campusCover.badgeText || 'Admissions Open 2026–27'}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-500 font-semibold tracking-widest uppercase text-xs">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>{identity.subtitle}</span>
                  <span className="text-stone-300">•</span>
                  <span>Est. {identity.establishedYear}</span>
                </div>
                
                <h1 className="font-serif-academy text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-950 tracking-tight leading-[1.12]">
                  {campusCover.heroTitle}
                </h1>
              </div>

              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-2xl">
                {campusCover.heroDescription}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#programs"
                  className="px-6 py-3.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-200 font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Explore Academic Programs</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#about"
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-semibold text-sm border border-stone-300 transition-colors shadow-2xs"
                >
                  About Our Heritage
                </a>
              </div>

              {/* Portal Quick Access Box */}
              <div className="p-4 rounded-2xl bg-white/80 border border-emerald-900/15 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    Authorized Academy Portals
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">Single Sign-On</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onOpenLogin('teacher')}
                    className="p-2.5 text-left rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                      <span>Teachers</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Academic register</span>
                  </button>

                  <button
                    onClick={() => onOpenLogin('parent')}
                    className="p-2.5 text-left rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
                      <span>Parents</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[10px] text-amber-700 block mt-0.5">Student progress</span>
                  </button>

                  <button
                    onClick={() => onOpenLogin('admin')}
                    className="p-2.5 text-left rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-stone-900 font-bold text-xs">
                      <span>Admin</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-0.5">Central controls</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Campus Cover Frame */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Decorative border backing */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-900/20 via-amber-700/10 to-transparent rounded-3xl transform rotate-1" />
                
                <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-200">
                    <img
                      src={campusCover.coverImageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"}
                      alt="Darussalam Academy Nandi Campus"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                        {identity.motto}
                      </p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {campusCover.campusLocation}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-900 text-amber-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-amber-300" />
                      <span className="font-semibold">{identity.academyName}</span>
                    </div>
                    <span className="text-[11px] text-emerald-200/80 font-mono">
                      Kerala, India
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Key Metrics / Institutional Highlights */}
      <section className="bg-emerald-900 text-white py-10 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {aboutUs.stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                <p className="font-serif-academy text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-emerald-100 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs & Curricula */}
      {appearance.showPrograms && (
        <section id="programs" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Academics & Formation
            </span>
            <h2 className="font-serif-academy text-3xl sm:text-4xl font-bold text-emerald-950 mt-3">
              Distinctive Curricular Programs
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              Combining authentic Islamic scholarship with modern state and university education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative h-44 bg-stone-200 overflow-hidden">
                  <img
                    src={prog.imageUrl}
                    alt={prog.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-950/90 text-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-xs">
                    {prog.duration}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-800 tracking-wide block">
                      {prog.tagline}
                    </span>
                    <h3 className="font-serif-academy text-lg font-bold text-emerald-950 mt-1 leading-snug">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                      Core Pillars
                    </p>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {prog.highlights.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Institutional About Us */}
      {appearance.showAbout && (
        <section id="about" className="py-20 bg-stone-100/60 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Heritage & Vision
                  </span>
                  <h2 className="font-serif-academy text-3xl sm:text-4xl font-bold text-emerald-950 mt-3">
                    About Darussalam Academy, Nandi
                  </h2>
                </div>

                <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
                  {aboutUs.history}
                </p>

                <p className="text-stone-600 leading-relaxed text-sm italic border-l-3 border-emerald-800 pl-4 bg-emerald-50/50 py-2 rounded-r-lg">
                  "{aboutUs.heritageParagraph}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white rounded-xl border border-stone-200">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 mb-1">
                      Our Sacred Mission
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {aboutUs.mission}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-stone-200">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 mb-1">
                      Our Vision
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {aboutUs.vision}
                    </p>
                  </div>
                </div>

              </div>

              {/* Campus Facilities List */}
              <div className="lg:col-span-6 bg-white p-7 sm:p-9 rounded-3xl border border-stone-200/90 shadow-md">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                  <Building className="w-6 h-6 text-emerald-800" />
                  <div>
                    <h3 className="font-serif-academy text-xl font-bold text-emerald-950">
                      Campus Facilities & Infrastructure
                    </h3>
                    <p className="text-xs text-stone-500">
                      Serene environment designed for spiritual and academic growth
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {aboutUs.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5 text-xs text-stone-800 font-medium"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-emerald-950 rounded-2xl text-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">Admissions Consultation Desk</p>
                    <p className="text-emerald-300 text-[11px] mt-0.5">Nandi, Kozhikode, Kerala</p>
                  </div>
                  <a
                    href="#contact"
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors shadow-2xs"
                  >
                    Contact Us
                  </a>
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* Achievements Showcase */}
      {appearance.showAchievements && (
        <section id="achievements" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Excellence & Accolades
            </span>
            <h2 className="font-serif-academy text-3xl sm:text-4xl font-bold text-emerald-950 mt-3">
              Institutional Achievements
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              Recognitions won by Darussalam students and faculty across Kerala and national platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={ach.imageUrl}
                    alt={ach.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {ach.year}
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {ach.category}
                  </span>
                  <h3 className="font-serif-academy text-lg font-bold text-emerald-950 mt-1">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Faculty Showcase */}
      {appearance.showFaculty && (
        <section id="faculty" className="py-20 bg-stone-100/50 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Eminent Mentors
              </span>
              <h2 className="font-serif-academy text-3xl sm:text-4xl font-bold text-emerald-950 mt-3">
                Faculty Scholars & Leadership
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-2">
                Esteemed educators combining profound traditional Islamic mastery with academic pedagogy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {faculty.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-stone-200/80 p-5 text-center shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-3 border-emerald-800/30 p-1 mb-4">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="font-serif-academy text-base font-bold text-emerald-950">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-800 mt-0.5">
                    {member.designation}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {member.department}
                  </p>
                  <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-600 space-y-0.5">
                    <p className="font-medium">{member.qualification}</p>
                    <p className="text-stone-400 font-mono text-[10px]">Exp: {member.experience}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Official Academy Notices */}
      {appearance.showAnnouncements && notices && notices.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Bulletin Board
              </span>
              <h2 className="font-serif-academy text-2xl sm:text-3xl font-bold text-emerald-950 mt-2">
                Official Academy Notices
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Regular academic, admission, and event circulars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notices.map((not) => (
              <div
                key={not.id}
                className={`p-5 rounded-2xl border transition-all ${
                  not.isImportant
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {not.date}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {not.category}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900 mt-1">
                  {not.title}
                </h4>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {not.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Us Section */}
      {appearance.showContact && (
        <section id="contact" className="py-20 bg-emerald-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-amber-300 bg-emerald-900 px-3 py-1 rounded-full border border-emerald-800">
                    Contact Administration
                  </span>
                  <h2 className="font-serif-academy text-3xl sm:text-4xl font-bold text-amber-100 mt-3">
                    Visit Darussalam Academy
                  </h2>
                  <p className="text-emerald-200/80 text-sm mt-2">
                    Our administrative secretariat in Nandi is at your service for admissions, scholarship inquiries, and parent meetings.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-emerald-100">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-900 text-amber-300 shrink-0 border border-emerald-800">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Academy Address</p>
                      <p className="mt-0.5">{contactUs.addressLine1}</p>
                      <p>{contactUs.addressLine2}</p>
                      <p>{contactUs.city}, {contactUs.district}, {contactUs.state} – {contactUs.pinCode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-900 text-amber-300 shrink-0 border border-emerald-800">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Phone Inquiries</p>
                      <p className="mt-0.5">Primary: {contactUs.phonePrimary}</p>
                      <p>Admissions: {contactUs.phoneSecondary}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-900 text-amber-300 shrink-0 border border-emerald-800">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Electronic Mail</p>
                      <p className="mt-0.5">Official: {contactUs.emailOfficial}</p>
                      <p>Admissions: {contactUs.emailAdmissions}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-900 text-amber-300 shrink-0 border border-emerald-800">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Secretariat Working Hours</p>
                      <p className="mt-0.5">{contactUs.workingHours}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Map / Directions Display */}
              <div className="lg:col-span-7 bg-emerald-900/60 p-6 sm:p-8 rounded-3xl border border-emerald-800/80 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-academy text-xl font-bold text-amber-200">
                    Location & Directions
                  </h3>
                  <p className="text-xs text-emerald-200/90 mt-1">
                    Situated on the scenic Malabar coastal corridor near Nandi Railway Gate, Koyilandy, Calicut.
                  </p>
                  
                  {/* Stylized Map View */}
                  <div className="mt-5 rounded-2xl overflow-hidden border border-emerald-800 bg-emerald-950 p-6 text-center space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center">
                      <MapPin className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Darussalam Academy, Nandi</h4>
                      <p className="text-xs text-emerald-300 font-mono mt-1">
                        GPS: 11.4589° N, 75.6984° E • Kozhikode Coast
                      </p>
                      <p className="text-xs text-stone-300 mt-2 max-w-md mx-auto">
                        Conveniently accessible by train (Nandi Station: 1.2 km) and National Highway 66 (Koyilandy / Vadakara stretch).
                      </p>
                    </div>
                    <div className="pt-2">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent('Darussalam Academy Nandi Kozhikode Kerala')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md transition-colors"
                      >
                        <span>Open Live Navigation in Google Maps</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-emerald-800/70 flex flex-wrap items-center justify-between text-xs text-emerald-300 gap-3">
                  <span>Affiliation: {identity.accreditation}</span>
                  <span>Registered Educational Trust, Kerala</span>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800/80">
            
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="font-serif-academy text-xl font-bold text-white">
                  {identity.academyName}
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Nandi, Kozhikode, Kerala. Dedicated to intellectual excellence, righteous morals, and authentic Islamic scholarship since 1998.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Academy Portals
              </p>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => onOpenLogin('teacher')} className="hover:text-amber-300 transition-colors">
                    Teachers' Academic Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLogin('parent')} className="hover:text-amber-300 transition-colors">
                    Parent Student Progress Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLogin('admin')} className="hover:text-amber-300 transition-colors">
                    Administrative Secretariat
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Contact Office
              </p>
              <p className="text-xs text-stone-400">
                Nandi Beach Road, Kozhikode, Kerala 673305
              </p>
              <p className="text-xs text-amber-300 font-mono">
                {contactUs.phonePrimary}
              </p>
              <p className="text-xs text-stone-400">
                {contactUs.emailOfficial}
              </p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>© 2026 Darussalam Academy. All rights reserved.</p>
            <p className="font-mono text-[11px] text-stone-600">
              Darussalam Academy, Nandi, Kerala • Institutional Web Portal
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};
