import React from 'react';
import { CHAPTERS } from '../data/defaultLessons';
import { Lesson } from '../types';
import { sound } from '../utils/sound';
import { BookMarked, CheckCircle2, ChevronRight, Laptop, Sparkles, BookOpen, Layers } from 'lucide-react';

interface SelectorBarProps {
  selectedGradeId: string;
  onSelectGrade: (gradeId: string) => void;
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  lessons: Lesson[];
  selectedLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  completedLessonIds: string[];
}

export const SelectorBar: React.FC<SelectorBarProps> = ({
  lessons,
  selectedLessonId,
  onSelectLesson,
  completedLessonIds,
}) => {
  // Determine current active chapter based on the selected lesson
  const currentLesson = lessons.find((l) => l.id === selectedLessonId);
  const initialChapterId = currentLesson?.unit?.includes('Chủ đề 2') ? 'chu-de-2' : (CHAPTERS[0]?.id || 'chu-de-2');

  const [activeChapterFilter, setActiveChapterFilter] = React.useState<string>(initialChapterId);

  // Sync active chapter filter when selected lesson changes
  React.useEffect(() => {
    if (currentLesson?.unit?.includes('Chủ đề 2')) {
      setActiveChapterFilter('chu-de-2');
    } else if (currentLesson?.unit?.includes('Chủ đề 1')) {
      setActiveChapterFilter('chu-de-1');
    }
  }, [selectedLessonId]);

  const currentChapter = CHAPTERS.find((c) => c.id === activeChapterFilter) || CHAPTERS[0];

  const displayedLessons = lessons.filter((l) => {
    if (activeChapterFilter === 'all') return true;
    if (activeChapterFilter === 'chu-de-2') return l.unit.includes('Chủ đề 2');
    if (activeChapterFilter === 'chu-de-1') return l.unit.includes('Chủ đề 1');
    return true;
  });

  return (
    <div className="bg-white/95 border-b border-indigo-100 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Banner Định Hướng Chuẩn Sách Giáo Khoa Lớp 3 */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-50 via-indigo-50 to-amber-50 border border-indigo-100 p-3 sm:p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs">
              LỚP 3
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-sm sm:text-base text-indigo-950 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-sky-600" />
                  MÔN TIN HỌC 3 · BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Tài liệu học tập chuẩn hóa theo Sách Giáo Khoa Tin học 3 (Kết nối tri thức với cuộc sống, trang 5 – 33)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700 bg-white/95 px-3 py-1.5 rounded-xl border border-rose-200 shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Giáo viên phụ trách: Cô Hồng Diệu
            </span>
          </div>
        </div>

        {/* Bộ Lọc Theo Chủ Đề SGK */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600" /> Chọn Chủ đề:
          </span>
          {CHAPTERS.map((ch) => {
            const isActive = activeChapterFilter === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  sound.playPop();
                  setActiveChapterFilter(ch.id);
                  // Auto-select first lesson in this chapter if current is not in it
                  const firstInCh = lessons.find((l) =>
                    ch.id === 'chu-de-2' ? l.unit.includes('Chủ đề 2') : l.unit.includes('Chủ đề 1')
                  );
                  if (firstInCh && !currentLesson?.unit.includes(ch.name.split(':')[0])) {
                    onSelectLesson(firstInCh.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {ch.badge}
                </span>
                {ch.name}
              </button>
            );
          })}
          <button
            onClick={() => {
              sound.playPop();
              setActiveChapterFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeChapterFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả bài học ({lessons.length})
          </button>
        </div>

        {/* Khối Chương & Bài Học Theo Tài Liệu SGK */}
        <div className="space-y-3">
          {/* Header Chương / Chủ Đề Đang Chọn */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 border border-slate-200/80 px-4 py-2.5 rounded-xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-sky-600 text-white uppercase tracking-wider">
                {currentChapter.badge}
              </span>
              <h3 className="font-heading text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                {currentChapter.name}
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              {currentChapter.description}
            </span>
          </div>

          {/* Danh Sách Bài Học Thuộc Chương */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Chọn bài học để ôn tập
              </span>
              <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {displayedLessons.length} bài học chuẩn SGK
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedLessons.map((lesson) => {
                const isSelected = lesson.id === selectedLessonId;
                const isCompleted = completedLessonIds.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      sound.playPop();
                      onSelectLesson(lesson.id);
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/80 shadow-xs ring-2 ring-indigo-500/20 scale-101'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/70 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wide bg-indigo-100/80 px-2 py-0.5 rounded-md truncate">
                          {lesson.unit}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Đạt ⭐
                          </span>
                        )}
                      </div>

                      <h4 className="font-heading text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {lesson.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {lesson.bookSeries}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                        {lesson.questions.length} câu hỏi
                      </span>
                      <span className={`font-bold flex items-center gap-0.5 ${
                        isSelected ? 'text-indigo-700 font-extrabold' : 'text-slate-500 group-hover:text-indigo-600'
                      }`}>
                        Vào học <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
