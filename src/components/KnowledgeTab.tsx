import React, { useState } from 'react';
import { Lesson } from '../types';
import { sound } from '../utils/sound';
import {
  CheckCircle,
  Lightbulb,
  BookOpen,
  Layers,
  ArrowRight,
  RotateCw,
  Sparkles,
  Volume2,
  Image as ImageIcon,
  FileText,
  Heart,
  Star,
  GraduationCap,
  PlayCircle,
} from 'lucide-react';

interface KnowledgeTabProps {
  lesson: Lesson;
  onStartQuiz: () => void;
}

export const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ lesson, onStartQuiz }) => {
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flashcard index when switching lessons
  React.useEffect(() => {
    setActiveFlashcardIndex(0);
    setIsFlipped(false);
  }, [lesson.id]);

  const flashcardCount = lesson.flashcards?.length || 0;
  const safeIndex = flashcardCount > 0 ? Math.min(activeFlashcardIndex, flashcardCount - 1) : 0;
  const currentFlashcard = lesson.flashcards?.[safeIndex];

  const handleNextCard = () => {
    if (flashcardCount === 0) return;
    sound.playPop();
    setIsFlipped(false);
    setActiveFlashcardIndex((prev) => (prev + 1) % flashcardCount);
  };

  const handlePrevCard = () => {
    if (flashcardCount === 0) return;
    sound.playPop();
    setIsFlipped(false);
    setActiveFlashcardIndex((prev) =>
      prev === 0 ? flashcardCount - 1 : prev - 1
    );
  };

  const handleCardFlip = () => {
    sound.playPop();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="space-y-6">
      {/* Lesson Hero Banner - Cheerful, colorful, inspiring for elementary kids */}
      <div className="bg-gradient-to-br from-indigo-600 via-sky-600 to-indigo-800 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        {/* Playful background decorative shapes */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs mb-2.5">
            <span className="font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-amber-200">
              {lesson.unit}
            </span>
            <span className="text-white/60">·</span>
            <span className="text-white/90 font-medium">{lesson.bookSeries}</span>
            <span className="text-white/60">·</span>
            <span className="bg-rose-500/90 text-white font-bold px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1 shadow-xs">
              <Heart className="w-2.5 h-2.5 fill-white" />
              Cô Hồng Diệu đồng hành
            </span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
            {lesson.title}
          </h2>

          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed font-medium max-w-2xl">
            Chào các em học sinh thân yêu! Hãy cùng Cô Hồng Diệu khám phá những kiến thức Tin học thú vị, rèn luyện tư duy và tích lũy thật nhiều ngôi sao may mắn nhé! ⭐
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sound.playPop();
                onStartQuiz();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all hover:scale-103 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-amber-500" />
              Làm bài ôn tập ngay ({lesson.questions.length} câu hỏi)
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <span className="text-xs text-sky-200 font-medium flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Điểm cộng sao sau mỗi câu trả lời đúng
            </span>
          </div>
        </div>
      </div>

      {/* Mục tiêu bài học (Sau bài này em sẽ:) */}
      {lesson.objectives && lesson.objectives.length > 0 && (
        <div className="bg-white rounded-3xl border border-indigo-100 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider mb-3.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-heading text-sm">Sau bài này các em sẽ đạt được:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.objectives.map((obj, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trực quan 3 dạng thông tin minh họa đặc biệt (Dành cho Tin học 3 SGK) */}
      {lesson.subjectId === 'tinhoc' && (
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-amber-50 rounded-3xl border border-sky-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
              <h4 className="font-heading font-extrabold text-sm sm:text-base text-indigo-950">
                Ba dạng thông tin thường gặp nhất quanh em (SGK trang 7 - 8)
              </h4>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-white/80 px-2.5 py-1 rounded-full border border-indigo-100">
              Nhấp thử để nghe âm thanh! 🔊
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Dạng Chữ */}
            <div className="bg-white rounded-2xl p-4 border-2 border-sky-100 shadow-xs hover:border-sky-300 transition-all hover:scale-101">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2.5">
                <FileText className="w-5 h-5" />
              </div>
              <h5 className="font-heading font-black text-sm text-sky-950 mb-1">
                1. Dạng CHỮ
              </h5>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                Được tạo nên từ các chữ cái, con số, ký tự để đọc và ghi chép.
              </p>
              <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-[11px] font-medium text-sky-800">
                📝 Ví dụ: Dòng chữ &ldquo;TRƯỜNG TIỂU HỌC KIM ĐỒNG&rdquo;, biển khẩu hiệu &ldquo;Muốn biết thì hỏi, Muốn giỏi thì học&rdquo;.
              </div>
            </div>

            {/* 2. Dạng Hình ảnh */}
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-xs hover:border-emerald-300 transition-all hover:scale-101">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h5 className="font-heading font-black text-sm text-emerald-950 mb-1">
                2. Dạng HÌNH ẢNH
              </h5>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                Được quan sát bằng mắt, gồm hình vẽ, ảnh chụp, tranh cổ động, biểu tượng.
              </p>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-medium text-emerald-800">
                🎨 Ví dụ: Tranh vẽ cổng trường, hình chú cá / trang giấy trên 3 thùng rác phân loại.
              </div>
            </div>

            {/* 3. Dạng Âm thanh */}
            <div
              onClick={() => sound.playVictory()}
              className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-xs hover:border-amber-400 transition-all hover:scale-101 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <PlayCircle className="w-3 h-3 text-amber-600" /> Nghe thử
                </span>
              </div>
              <h5 className="font-heading font-black text-sm text-amber-950 mb-1">
                3. Dạng ÂM THANH
              </h5>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                Được cảm nhận qua đôi tai, gồm tiếng động, lời nói, giai điệu bài hát.
              </p>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-800">
                🔔 Ví dụ: Tiếng chuông báo thức reo reng reng, tiếng chim hót, tiếng trống trường tùng tùng!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kiến thức trọng tâm cần nhớ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl ring-2 ring-amber-400 overflow-hidden shadow-xs shrink-0 bg-amber-100">
              <img
                src="/src/assets/images/avatar_chao_nam_hoc_moi_1791386750428.jpg"
                alt="Cô Hồng Diệu"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900">
                Kiến thức cốt lõi cần nhớ
              </h3>
              <span className="text-xs text-rose-700 font-bold">♥ Lời dặn của Cô Hồng Diệu</span>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Chuẩn SGK Kết nối tri thức
          </span>
        </div>

        {/* Core summary points with cheerful numbers */}
        <div className="space-y-3 mb-6">
          {lesson.summaryPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-slate-800 text-xs sm:text-sm leading-relaxed"
            >
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {index + 1}
              </span>
              <p className="font-semibold text-slate-800 pt-0.5">{point}</p>
            </div>
          ))}
        </div>

        {/* Detailed notes & tables */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          {lesson.detailedNotes.map((note) => (
            <div key={note.id} className="space-y-2.5">
              <h4 className="font-heading text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                {note.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {note.content}
              </p>

              {note.highlight && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-2xl text-xs sm:text-sm text-amber-950 font-bold">
                  {note.highlight}
                </div>
              )}

              {note.tableData && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-indigo-50/80 border-b border-indigo-100 text-indigo-950">
                        {note.tableData.headers.map((h, idx) => (
                          <th key={idx} className="p-3 font-extrabold font-heading">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {note.tableData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-indigo-50/30 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-slate-700 leading-normal font-medium">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Thẻ ghi nhớ Flashcards tương tác vui tươi */}
      {lesson.flashcards && lesson.flashcards.length > 0 && currentFlashcard && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-900">
                Thẻ ghi nhớ thông minh (Chạm để lật thẻ)
              </h4>
            </div>
            <span className="text-xs text-indigo-700 font-bold font-mono bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Thẻ {activeFlashcardIndex + 1} / {lesson.flashcards.length}
            </span>
          </div>

          <div
            onClick={handleCardFlip}
            className={`min-h-[170px] p-6 rounded-3xl cursor-pointer flex flex-col justify-center items-center text-center relative group transition-all duration-300 border-2 ${
              isFlipped
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
                : 'bg-gradient-to-br from-indigo-50 to-sky-50 border-indigo-300'
            }`}
          >
            <span
              className={`text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full mb-3 ${
                isFlipped
                  ? 'bg-emerald-200/80 text-emerald-900'
                  : 'bg-indigo-200/80 text-indigo-900'
              }`}
            >
              {isFlipped ? '✅ Đáp án ghi nhớ' : '❓ Câu hỏi gợi nhớ'}
            </span>

            <p className="font-heading text-sm sm:text-base font-extrabold text-slate-900 max-w-lg whitespace-pre-line leading-relaxed">
              {isFlipped ? currentFlashcard.back : currentFlashcard.front}
            </p>

            {isFlipped && currentFlashcard.tip && (
              <p className="text-xs text-emerald-800 mt-3 font-bold bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                💡 {currentFlashcard.tip}
              </p>
            )}

            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform text-indigo-600" />
              <span>Nhấp vào đây để xem {isFlipped ? 'câu hỏi' : 'đáp án'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handlePrevCard}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              ← Thẻ trước
            </button>
            <button
              onClick={handleNextCard}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Thẻ kế tiếp →
            </button>
          </div>
        </div>
      )}

      {/* Bottom CTA to start quiz */}
      <div className="p-5 bg-gradient-to-r from-indigo-100 via-sky-100 to-amber-100 rounded-3xl border border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-heading font-extrabold text-sm sm:text-base text-indigo-950">
            Các em đã sẵn sàng thử tài trả lời câu hỏi chưa?
          </h4>
          <p className="text-xs text-indigo-800 font-medium">
            Có đầy đủ câu hỏi từ Dễ đến Khó để các em luyện tập và nhận những ngôi sao may mắn từ Cô Hồng Diệu!
          </p>
        </div>
        <button
          onClick={() => {
            sound.playPop();
            onStartQuiz();
          }}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap shadow-md transition-all hover:scale-103 cursor-pointer flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Bắt đầu luyện tập ngay
        </button>
      </div>
    </div>
  );
};
