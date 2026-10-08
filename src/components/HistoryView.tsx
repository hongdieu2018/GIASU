import React from 'react';
import { Lesson, StudentProfile } from '../types';
import { Trophy, Calendar, Clock, RotateCcw, Award, CheckCircle2, Star, Sparkles } from 'lucide-react';

interface HistoryViewProps {
  profile: StudentProfile;
  lessons: Lesson[];
  onSelectLesson: (lessonId: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  profile,
  lessons,
  onSelectLesson,
  onClearHistory,
}) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const getLessonTitle = (id: string) => {
    const l = lessons.find((x) => x.id === id);
    return l ? l.title : 'Bài học đã lưu';
  };

  const getLessonSubjectName = (id: string) => {
    const l = lessons.find((x) => x.id === id);
    if (!l) return '';
    return l.unit;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl ring-3 ring-amber-300 overflow-hidden shadow-md shrink-0 bg-white/20">
            <img
              src="/src/assets/images/avatar_chao_nam_hoc_moi_1791386750428.jpg"
              alt="Cô Giáo Hồng Diệu"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-200 font-extrabold block mb-0.5">
              Bảng vàng thành tích học sinh · Cô Hồng Diệu
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black">{profile.name}</h2>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-0.5 font-medium">
              Điểm số và số sao may mắn được tự động lưu trên máy để các em theo dõi tiến bộ mỗi ngày! ⭐
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl px-4 py-3 text-center border border-white/20">
            <div className="flex items-center justify-center gap-1.5 text-amber-300">
              <Sparkles className="w-5 h-5 fill-amber-300" />
              <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-white">
                {profile.stars}
              </span>
            </div>
            <span className="text-[11px] text-amber-100 uppercase tracking-wide font-bold">
              Sao tích lũy
            </span>
          </div>

          <div className="bg-white/15 backdrop-blur-xs rounded-2xl px-4 py-3 text-center border border-white/20">
            <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-white block">
              {profile.completedLessons.length}
            </span>
            <span className="text-[11px] text-amber-100 uppercase tracking-wide font-bold">
              Bài đã đạt
            </span>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Lịch sử các lần ôn tập
            </h3>
            <span className="text-xs text-slate-500">
              Đã ghi nhận {profile.history.length} lượt làm bài
            </span>
          </div>

          {profile.history.length > 0 && (
            <div className="flex items-center gap-2">
              {showConfirm ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl text-xs">
                  <span className="text-rose-800 font-bold">Chắc chắn xóa?</span>
                  <button
                    onClick={() => {
                      onClearHistory();
                      setShowConfirm(false);
                    }}
                    className="font-black text-rose-600 hover:text-rose-800 px-1.5 py-0.5 bg-white rounded-md border border-rose-300 shadow-2xs cursor-pointer"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="font-bold text-slate-500 hover:text-slate-800 px-1 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors font-semibold cursor-pointer"
                >
                  Xóa lịch sử
                </button>
              )}
            </div>
          )}
        </div>

        {profile.history.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">
              Chưa có lượt ôn tập nào được ghi nhận.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy chọn bài học và bắt đầu luyện tập để nhận điểm sao nhé!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {profile.history.map((item, idx) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              });
              const percent = Math.round(
                (item.correctCount / Math.max(1, item.totalCount)) * 100
              );

              return (
                <div
                  key={idx}
                  className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {getLessonTitle(item.lessonId)}
                      </span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] text-indigo-600 font-semibold truncate">
                        {getLessonSubjectName(item.lessonId)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.timeSpentSeconds}s
                      </span>
                      <span className="font-mono text-emerald-600 font-bold">
                        {item.correctCount}/{item.totalCount} câu đúng
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black font-mono tabular-nums text-indigo-600 block">
                        {item.totalScore} điểm
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          percent >= 80
                            ? 'text-emerald-600'
                            : percent >= 50
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {percent}% chính xác
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectLesson(item.lessonId)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Làm lại
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
