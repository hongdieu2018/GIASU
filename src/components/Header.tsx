import React from 'react';
import { BookOpen, Sparkles, Volume2, VolumeX, Laptop, History, Settings, Heart, Award } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  currentView: 'student' | 'teacher' | 'history';
  onViewChange: (view: 'student' | 'teacher' | 'history') => void;
  profile: StudentProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeLessonTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  profile,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
        {/* Zone 1: Brand title & Teacher attribution (Target element) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewChange('student')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="relative">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ring-2 ring-amber-400 shadow-md shadow-amber-200/80 group-hover:scale-105 transition-transform overflow-hidden bg-gradient-to-tr from-amber-200 to-sky-300">
                <img
                  src="/src/assets/images/avatar_chao_nam_hoc_moi_1791386750428.jpg"
                  alt="Cô Giáo Hồng Diệu - Chào Năm Học Mới"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white"></span>
              </span>
            </div>

            <div>
              <span className="font-heading font-extrabold text-base sm:text-xl tracking-tight text-indigo-950 block leading-tight group-hover:text-indigo-600 transition-colors">
                GIA SƯ TIN HỌC LỚP 3
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full">
                  <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                  GIÁO VIÊN: HỒNG DIỆU
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                  · Kết nối tri thức với cuộc sống
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => onViewChange('student')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              currentView === 'student'
                ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Góc Học Sinh
            </span>
          </button>

          <button
            onClick={() => onViewChange('teacher')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              currentView === 'teacher'
                ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-emerald-500" />
              Soạn Bài (Giáo Viên)
            </span>
          </button>

          <button
            onClick={() => onViewChange('history')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              currentView === 'history'
                ? 'bg-white text-amber-700 shadow-xs ring-1 ring-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Bảng Thành Tích
            </span>
          </button>
        </nav>

        {/* Zone 3: Student Stats & Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh vui nhộn'}
            className="p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            aria-label="Chuyển trạng thái âm thanh"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-indigo-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Star counter with joyful badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl text-amber-900 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
            <span className="text-xs font-black font-mono tabular-nums">
              {profile.stars}
            </span>
            <span className="text-[11px] font-bold text-amber-700 hidden sm:inline">sao ⭐</span>
          </div>

          {/* Mobile switcher button */}
          <button
            onClick={() => onViewChange(currentView === 'teacher' ? 'student' : 'teacher')}
            className="md:hidden px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200"
          >
            {currentView === 'teacher' ? 'Học sinh' : 'Giáo viên'}
          </button>
        </div>
      </div>
    </header>
  );
};
