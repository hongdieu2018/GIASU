import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { DifficultyLevel, Lesson, Question, QuizAttemptResult } from '../types';
import { sound } from '../utils/sound';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
  Clock,
  BookOpen,
  Filter,
  Check,
  Send,
  AlertCircle,
  Heart,
  Star,
  User,
  Sliders,
  Settings2,
  Edit2,
  Play,
} from 'lucide-react';

export type UserLevelChoice = 'all' | 'easy' | 'medium' | 'hard';

interface QuizPlayerProps {
  lesson: Lesson;
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  onBackToKnowledge: () => void;
  onCompleteAttempt: (result: QuizAttemptResult) => void;
  onAskAI?: (question: Question) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  lesson,
  studentName,
  onUpdateStudentName,
  onBackToKnowledge,
  onCompleteAttempt,
  onAskAI,
}) => {
  // Setup configuration states
  const [nameInput, setNameInput] = useState<string>(studentName || 'Bé Yêu Tin Học');
  const [levelChoice, setLevelChoice] = useState<UserLevelChoice>('all');
  const [questionCountChoice, setQuestionCountChoice] = useState<number>(10);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [reviewWrongIds, setReviewWrongIds] = useState<string[] | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (studentName) {
      setNameInput(studentName);
    }
  }, [studentName]);

  // Filter and limit questions based on setup
  const filteredQuestions = useMemo(() => {
    let pool = lesson.questions;

    // If reviewing wrong answers only
    if (reviewWrongIds && reviewWrongIds.length > 0) {
      return pool.filter((q) => reviewWrongIds.includes(q.id));
    }

    if (levelChoice === 'easy') {
      pool = lesson.questions.filter((q) => q.difficulty === 'easy');
    } else if (levelChoice === 'medium') {
      pool = lesson.questions.filter((q) => q.difficulty === 'medium');
    } else if (levelChoice === 'hard') {
      pool = lesson.questions.filter((q) => q.difficulty === 'hard' || q.difficulty === 'expert');
    }

    // Limit to questionCountChoice (up to 30)
    const effectiveLimit = Math.min(30, Math.max(1, questionCountChoice));
    return pool.slice(0, effectiveLimit);
  }, [lesson.questions, levelChoice, questionCountChoice, reviewWrongIds]);

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset quiz state when lesson changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption('');
    setTextAnswer('');
    setIsChecked(false);
    setIsCurrentCorrect(null);
    setAnswersRecord({});
    setIsCompleted(false);
    setReviewWrongIds(null);
    setStartTime(Date.now());
  }, [lesson.id]);

  // Answer state for current question
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);

  // Stored results across this attempt
  const [answersRecord, setAnswersRecord] = useState<
    Record<
      string,
      {
        userAnswer: string | string[];
        isCorrect: boolean;
        pointsEarned: number;
      }
    >
  >({});

  // Timer & completion
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  const resetCurrentInputs = () => {
    setSelectedOption('');
    setTextAnswer('');
    setIsChecked(false);
    setIsCurrentCorrect(null);
  };

  // Start or restart quiz with selected settings
  const handleStartQuizWithSettings = () => {
    sound.playPop();
    const cleanName = nameInput.trim() || 'Học sinh chăm chỉ';
    onUpdateStudentName(cleanName);
    setReviewWrongIds(null);
    setIsConfiguring(false);
    setIsCompleted(false);
    setAnswersRecord({});
    setCurrentIndex(0);
    setStartTime(Date.now());
    resetCurrentInputs();
  };

  // Check the answer
  const handleCheckAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;
    let userAns = '';

    if (currentQuestion.type === 'text_input') {
      const cleanInput = textAnswer.trim().toLowerCase();
      userAns = textAnswer.trim();

      if (Array.isArray(currentQuestion.correctAnswer)) {
        correct = currentQuestion.correctAnswer.some(
          (ans) =>
            cleanInput === ans.toLowerCase().trim() ||
            cleanInput.includes(ans.toLowerCase().trim())
        );
      } else {
        correct = cleanInput === currentQuestion.correctAnswer.toLowerCase().trim();
      }
    } else {
      userAns = selectedOption;
      correct = selectedOption === currentQuestion.correctAnswer;
    }

    setIsCurrentCorrect(correct);
    setIsChecked(true);

    if (correct) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }

    // Record answer
    setAnswersRecord((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: userAns,
        isCorrect: correct,
        pointsEarned: correct ? currentQuestion.points : 0,
      },
    }));
  };

  // Next question or finish
  const handleNextQuestion = () => {
    sound.playPop();
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetCurrentInputs();
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const totalScore = Object.values(answersRecord).reduce(
      (sum, item) => sum + item.pointsEarned,
      0
    );
    const maxScore = filteredQuestions.reduce((sum, q) => sum + q.points, 0);
    const correctCount = Object.values(answersRecord).filter((item) => item.isCorrect).length;

    const result: QuizAttemptResult = {
      lessonId: lesson.id,
      timestamp: Date.now(),
      totalScore,
      maxScore,
      correctCount,
      totalCount: filteredQuestions.length,
      timeSpentSeconds: elapsedSeconds,
      studentName: nameInput.trim() || 'Học sinh chăm chỉ',
      selectedLevel: levelChoice,
      answers: answersRecord,
    };

    setIsCompleted(true);
    sound.playVictory();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onCompleteAttempt(result);
  };

  const handleRestartFull = () => {
    sound.playPop();
    setReviewWrongIds(null);
    setIsCompleted(false);
    setAnswersRecord({});
    setCurrentIndex(0);
    setStartTime(Date.now());
    resetCurrentInputs();
  };

  const handleReviewWrongOnly = () => {
    sound.playPop();
    const wrongIds = Object.entries(answersRecord)
      .filter(([, val]) => !val.isCorrect)
      .map(([id]) => id);

    if (wrongIds.length === 0) return;

    setReviewWrongIds(wrongIds);
    setIsCompleted(false);
    setAnswersRecord({});
    setCurrentIndex(0);
    setStartTime(Date.now());
    resetCurrentInputs();
  };

  // Helper text and badge for difficulty
  const getDifficultyBadge = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'easy':
        return {
          label: 'Nhận biết · Dễ',
          stars: '⭐',
          color: 'text-emerald-800 bg-emerald-50 border-emerald-300',
        };
      case 'medium':
        return {
          label: 'Thông hiểu · Trung bình',
          stars: '⭐⭐',
          color: 'text-sky-800 bg-sky-50 border-sky-300',
        };
      case 'hard':
        return {
          label: 'Vận dụng · Khó',
          stars: '⭐⭐⭐',
          color: 'text-amber-800 bg-amber-50 border-amber-300',
        };
      case 'expert':
        return {
          label: 'Thử thách · Nâng cao',
          stars: '⭐⭐⭐⭐',
          color: 'text-purple-800 bg-purple-50 border-purple-300',
        };
    }
  };

  const getLevelLabel = (lvl: UserLevelChoice) => {
    switch (lvl) {
      case 'easy':
        return '⭐ Mức độ Dễ';
      case 'medium':
        return '⭐⭐ Mức độ Trung bình';
      case 'hard':
        return '⭐⭐⭐ Mức độ Khó';
      case 'all':
      default:
        return '🌟 Tất cả mức độ';
    }
  };

  // RENDER 1: Setup Configuration Card (When user wants to configure or change options)
  if (isConfiguring) {
    const maxAvailable = (() => {
      if (levelChoice === 'easy') {
        return lesson.questions.filter((q) => q.difficulty === 'easy').length;
      }
      if (levelChoice === 'medium') {
        return lesson.questions.filter((q) => q.difficulty === 'medium').length;
      }
      if (levelChoice === 'hard') {
        return lesson.questions.filter((q) => q.difficulty === 'hard' || q.difficulty === 'expert').length;
      }
      return lesson.questions.length;
    })();

    return (
      <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl ring-3 ring-amber-400 overflow-hidden mx-auto shadow-md shadow-amber-100 bg-amber-100">
            <img
              src="/src/assets/images/avatar_chao_nam_hoc_moi_1791386750428.jpg"
              alt="Cô Giáo Hồng Diệu"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-indigo-950">
            Tùy Chỉnh Bài Ôn Tập Của Em
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
            Nhập tên của em, chọn mức độ bài học và số lượng câu hỏi phù hợp nhé!
          </p>
        </div>

        {/* 1. Nhập tên học sinh */}
        <div className="bg-gradient-to-r from-indigo-50/70 to-sky-50/70 p-4 sm:p-5 rounded-2xl border border-indigo-100 space-y-2">
          <label className="font-heading text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            1. Nhập họ và tên của em:
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Ví dụ: Nguyễn Minh Khang, Bé An, Trần Tuệ Anh..."
            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-3 focus:ring-indigo-300"
          />
          <p className="text-[11px] text-slate-500 font-medium">
            Tên của em sẽ được ghi nhận trên Giấy khen và Bảng vàng sau khi làm bài xong! ⭐
          </p>
        </div>

        {/* 2. Chọn mức độ (Dễ, Trung bình, Khó, Tất cả) */}
        <div className="space-y-2.5">
          <label className="font-heading text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            2. Chọn mức độ câu hỏi:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setLevelChoice('all');
              }}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                levelChoice === 'all'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-black shadow-xs ring-2 ring-indigo-200'
                  : 'border-slate-200 hover:border-indigo-200 bg-white text-slate-700 font-bold'
              }`}
            >
              <span className="block text-sm mb-0.5">🌟</span>
              <span className="text-xs">Tất cả</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setLevelChoice('easy');
              }}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                levelChoice === 'easy'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-xs ring-2 ring-emerald-200'
                  : 'border-slate-200 hover:border-emerald-200 bg-white text-slate-700 font-bold'
              }`}
            >
              <span className="block text-sm mb-0.5">⭐</span>
              <span className="text-xs">Dễ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setLevelChoice('medium');
              }}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                levelChoice === 'medium'
                  ? 'border-sky-600 bg-sky-50 text-sky-900 font-black shadow-xs ring-2 ring-sky-200'
                  : 'border-slate-200 hover:border-sky-200 bg-white text-slate-700 font-bold'
              }`}
            >
              <span className="block text-sm mb-0.5">⭐⭐</span>
              <span className="text-xs">Trung bình</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setLevelChoice('hard');
              }}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                levelChoice === 'hard'
                  ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-xs ring-2 ring-amber-200'
                  : 'border-slate-200 hover:border-amber-200 bg-white text-slate-700 font-bold'
              }`}
            >
              <span className="block text-sm mb-0.5">⭐⭐⭐</span>
              <span className="text-xs">Khó</span>
            </button>
          </div>
        </div>

        {/* 3. Tùy chỉnh chọn số lượng câu hỏi (tối đa 30 câu hỏi) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-heading text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              3. Chọn số lượng câu hỏi (Tối đa 30 câu):
            </label>
            <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
              Đang chọn: {questionCountChoice} câu
            </span>
          </div>

          {/* Quick pick buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[5, 10, 15, 20, 25, 30].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  sound.playPop();
                  setQuestionCountChoice(num);
                }}
                className={`py-2 px-3 rounded-xl border-2 font-black text-xs transition-all cursor-pointer tabular-nums ${
                  questionCountChoice === num
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'
                }`}
              >
                {num} câu
              </button>
            ))}
          </div>

          {/* Slider for smooth selection up to 30 */}
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={questionCountChoice}
              onChange={(e) => setQuestionCountChoice(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>1 câu</span>
              <span>15 câu</span>
              <span className="font-bold text-indigo-600">30 câu (Tối đa)</span>
            </div>
          </div>
        </div>

        {/* Summary note */}
        <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-950 font-medium flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Bài ôn tập sẽ có <strong>{Math.min(questionCountChoice, maxAvailable)} câu hỏi</strong>{' '}
            thuộc <strong>{getLevelLabel(levelChoice)}</strong>.
          </span>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleStartQuizWithSettings}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-black text-sm shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Bắt đầu làm bài thi ({Math.min(questionCountChoice, maxAvailable)} câu)
          </button>
        </div>
      </div>
    );
  }

  // RENDER 2: Completion Screen (With Student Name on Honor Certificate)
  if (isCompleted) {
    const totalScore = Object.values(answersRecord).reduce(
      (sum, item) => sum + item.pointsEarned,
      0
    );
    const maxScore = filteredQuestions.reduce((sum, q) => sum + q.points, 0);
    const correctCount = Object.values(answersRecord).filter((item) => item.isCorrect).length;
    const percentage = Math.round((correctCount / Math.max(1, filteredQuestions.length)) * 100);
    const wrongCount = filteredQuestions.length - correctCount;

    let honorTitle = 'Cố gắng lên nào bé ơi!';
    let honorMessage = 'Cô Hồng Diệu tin rằng nếu xem lại phần Kiến thức cần nhớ, em sẽ đạt điểm 10 ở lần làm lại!';

    if (percentage === 100) {
      honorTitle = '🏆 Trạng Nguyên Tin Học Nhí Xuất Sắc!';
      honorMessage = 'Thật tuyệt vời! Em trả lời đúng tất cả các câu hỏi và được Cô Hồng Diệu khen ngợi hết lời!';
    } else if (percentage >= 80) {
      honorTitle = '🌟 Học Sinh Chăm Ngoan Điểm 9, Điểm 10!';
      honorMessage = 'Thành tích rất ấn tượng! Chỉ thiếu một chút nữa là trọn vẹn điểm số rồi đó!';
    } else if (percentage >= 60) {
      honorTitle = '⭐ Đạt Yêu Cầu Rất Tốt!';
      honorMessage = 'Em đã nắm được phần lớn kiến thức. Hãy thử sức thêm với các câu hỏi vận dụng nhé!';
    }

    return (
      <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 sm:p-9 max-w-2xl mx-auto shadow-md text-center">
        {/* Certificate Stamp */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl ring-3 ring-amber-400 overflow-hidden shadow-md shadow-amber-100 bg-amber-100">
            <img
              src="/src/assets/images/avatar_chao_nam_hoc_moi_1791386750428.jpg"
              alt="Cô Giáo Hồng Diệu"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-md animate-gentle-bounce">
            <Trophy className="w-9 h-9 text-amber-900 fill-amber-500" />
          </div>
        </div>

        {/* Student name acknowledgment badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-full text-rose-800 text-xs font-black uppercase tracking-wider mb-2">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          Khen tặng học sinh: {nameInput.trim() || 'Học sinh chăm chỉ'}
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl font-black text-indigo-950 mt-1 mb-2">
          {honorTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 font-medium leading-relaxed">
          {honorMessage}
        </p>

        {/* Score cards with bright pastel look */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-indigo-50 via-sky-50 to-amber-50 rounded-2xl border border-indigo-100 mb-6">
          <div className="bg-white/80 p-3 rounded-xl shadow-2xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">Tổng điểm</span>
            <span className="font-heading text-xl sm:text-2xl font-black text-indigo-600 font-mono tabular-nums">
              {totalScore}
              <span className="text-xs text-slate-400 font-normal">/{maxScore}</span>
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl shadow-2xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">Số câu đúng</span>
            <span className="font-heading text-xl sm:text-2xl font-black text-emerald-600 font-mono tabular-nums">
              {correctCount}/{filteredQuestions.length}
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl shadow-2xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">Tỉ lệ đạt</span>
            <span className="font-heading text-xl sm:text-2xl font-black text-amber-600 font-mono tabular-nums">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Breakdown by difficulty */}
        <div className="text-left bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-xs">
          <h4 className="font-heading font-extrabold text-slate-800 mb-2.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              Chi tiết bài thi của {nameInput}:
            </span>
            <span className="text-xs text-indigo-600 font-bold">
              {getLevelLabel(levelChoice)}
            </span>
          </h4>
          <div className="space-y-2">
            {(['easy', 'medium', 'hard', 'expert'] as DifficultyLevel[]).map((level) => {
              const qInLevel = filteredQuestions.filter((q) => q.difficulty === level);
              if (qInLevel.length === 0) return null;
              const correctInLevel = qInLevel.filter(
                (q) => answersRecord[q.id]?.isCorrect
              ).length;
              const meta = getDifficultyBadge(level);

              return (
                <div key={level} className="flex items-center justify-between py-1.5 border-b border-slate-200/60 last:border-0 font-medium">
                  <span className="text-slate-700">
                    {meta.stars} {meta.label}
                  </span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                    {correctInLevel} / {qInLevel.length} câu đúng
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleRestartFull}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại bài này
          </button>

          {wrongCount > 0 && (
            <button
              onClick={handleReviewWrongOnly}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-slate-950" />
              Luyện lại {wrongCount} câu sai
            </button>
          )}

          <button
            onClick={() => {
              sound.playPop();
              setIsConfiguring(true);
            }}
            className="px-5 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-2xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-sky-700" />
            Đổi số lượng / mức độ
          </button>

          <button
            onClick={onBackToKnowledge}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Xem bài học
          </button>
        </div>
      </div>
    );
  }

  // If no questions match filter
  if (!currentQuestion) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-sm text-slate-600">
          Chưa tìm thấy câu hỏi phù hợp với bộ lọc mức độ hiện tại.
        </p>
        <button
          onClick={() => {
            setLevelChoice('all');
            setQuestionCountChoice(10);
            setIsConfiguring(false);
          }}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold"
        >
          Chọn tất cả các câu hỏi
        </button>
      </div>
    );
  }

  const diffBadge = getDifficultyBadge(currentQuestion.difficulty);
  const progressPercent = Math.round(((currentIndex + 1) / filteredQuestions.length) * 100);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Review wrong banner if active */}
      {reviewWrongIds && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-950 font-bold">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            Đang luyện lại {filteredQuestions.length} câu trả lời chưa đúng · Cố lên em nhé!
          </span>
          <button
            onClick={handleRestartFull}
            className="text-indigo-700 underline font-extrabold hover:text-indigo-900 cursor-pointer text-[11px]"
          >
            Làm lại cả bài
          </button>
        </div>
      )}

      {/* Top Banner with Student Name, Level Buttons & Question Count (Tối đa 30 câu) */}
      <div className="bg-white rounded-3xl border border-indigo-100 p-4 sm:p-5 shadow-xs space-y-3">
        {/* Row 1: Student info & Quick customizer trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Student name display with quick edit */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold leading-none">
                Học sinh đang làm bài:
              </span>
              <span className="font-heading font-black text-sm text-indigo-950">
                {nameInput.trim() || 'Học sinh chăm chỉ'}
              </span>
            </div>
          </div>

          {/* Quick Config Button */}
          <button
            onClick={() => {
              sound.playPop();
              setIsConfiguring(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            Tùy chỉnh số câu & mức độ
          </button>
        </div>

        {/* Row 2: Level Selection Buttons & Question Counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Nút chọn mức độ (Dễ, Trung bình, Khó, Tất cả) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto max-w-full">
            <button
              onClick={() => {
                sound.playPop();
                setLevelChoice('all');
                setCurrentIndex(0);
                resetCurrentInputs();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                levelChoice === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌟 Tất cả
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setLevelChoice('easy');
                setCurrentIndex(0);
                resetCurrentInputs();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                levelChoice === 'easy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⭐ Dễ
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setLevelChoice('medium');
                setCurrentIndex(0);
                resetCurrentInputs();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                levelChoice === 'medium'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⭐⭐ Trung bình
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setLevelChoice('hard');
                setCurrentIndex(0);
                resetCurrentInputs();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                levelChoice === 'hard'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⭐⭐⭐ Khó
            </button>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2.5 text-xs text-slate-600 font-bold shrink-0">
            <span className="font-mono tabular-nums bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-200">
              Câu {currentIndex + 1} / {filteredQuestions.length}
            </span>
            <span className="font-mono tabular-nums bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              +{currentQuestion.points} điểm
            </span>
          </div>
        </div>

        {/* Visual Progress Bar - Cheerful Gradient */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border-2 border-indigo-100 p-5 sm:p-7 shadow-xs space-y-5">
        {/* Header of Question: Level & Context */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${diffBadge.color}`}
            >
              <span>{diffBadge.stars}</span>
              <span>{diffBadge.label}</span>
            </span>

            {currentQuestion.type === 'text_input' && (
              <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full font-bold">
                Điền từ / Tự luận ngắn
              </span>
            )}
          </div>

          {onAskAI && (
            <button
              onClick={() => {
                sound.playPop();
                onAskAI(currentQuestion);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Gợi ý từ Gia Sư
            </button>
          )}
        </div>

        {/* Context Snippet if any (e.g. Tình huống SGK) */}
        {currentQuestion.contextSnippet && (
          <div className="p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50 border-l-4 border-indigo-500 rounded-r-2xl text-xs sm:text-sm text-slate-700">
            <span className="font-bold text-indigo-950 block mb-0.5">
              📖 Tình huống trong sách giáo khoa:
            </span>
            <p className="font-medium text-slate-800">{currentQuestion.contextSnippet}</p>
          </div>
        )}

        {/* Question Prompt */}
        <div>
          <h3 className="font-heading text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
            {currentQuestion.prompt}
          </h3>
        </div>

        {/* Options / Input Form */}
        {currentQuestion.type === 'text_input' ? (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              Nhập câu trả lời của em vào đây:
            </label>
            <div className="flex gap-2.5">
              <input
                type="text"
                disabled={isChecked}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isChecked && textAnswer.trim()) {
                    handleCheckAnswer();
                  }
                }}
                placeholder="Gõ từ hoặc chữ vào đây nhé..."
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-indigo-200 text-sm focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-500 font-medium"
              />
              {!isChecked && (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!textAnswer.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Kiểm tra
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Multiple Choice options with colorful letters */
          <div className="space-y-3 pt-1">
            {currentQuestion.options?.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isTheCorrectOne = opt.id === currentQuestion.correctAnswer;

              let itemStyle = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 hover:scale-100.5';
              if (isSelected && !isChecked) {
                itemStyle = 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500 scale-100.5 shadow-xs';
              } else if (isChecked) {
                if (isTheCorrectOne) {
                  itemStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 font-bold';
                } else if (isSelected && !isTheCorrectOne) {
                  itemStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400';
                } else {
                  itemStyle = 'border-slate-200 opacity-60 bg-white';
                }
              }

              // Letter colors
              const letterColors: Record<string, string> = {
                A: 'bg-sky-100 text-sky-800',
                B: 'bg-emerald-100 text-emerald-800',
                C: 'bg-amber-100 text-amber-800',
                D: 'bg-purple-100 text-purple-800',
              };

              return (
                <button
                  key={opt.id}
                  disabled={isChecked}
                  onClick={() => {
                    sound.playPop();
                    setSelectedOption(opt.id);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 cursor-pointer ${itemStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl font-heading font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                      isChecked && isTheCorrectOne
                        ? 'bg-emerald-600 text-white'
                        : isChecked && isSelected && !isTheCorrectOne
                        ? 'bg-rose-500 text-white'
                        : isSelected
                        ? 'bg-indigo-600 text-white'
                        : letterColors[opt.id] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold leading-relaxed pt-0.5">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Instant Check Button if not checked and choice type */}
        {!isChecked && currentQuestion.type !== 'text_input' && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
              className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              Kiểm tra đáp án ngay
            </button>
          </div>
        )}

        {/* Result & Detailed Explanation Box */}
        {isChecked && (
          <div
            className={`p-5 rounded-3xl border-2 transition-all space-y-3.5 ${
              isCurrentCorrect
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs'
            }`}
          >
            {/* Header: Đúng / Sai with Teacher's warm praise */}
            <div className="flex items-center gap-2.5 font-heading font-extrabold text-sm sm:text-base">
              {isCurrentCorrect ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-900">
                    Chính xác rồi! Cô Hồng Diệu khen em rất giỏi! (+{currentQuestion.points} điểm ⭐)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <span className="text-rose-900">
                    Tiếc quá, chưa chính xác! Em đừng buồn, hãy xem lời giải để nhớ bài nhé!
                  </span>
                </>
              )}
            </div>

            {/* Detailed Explanation */}
            <div className="text-xs sm:text-sm leading-relaxed text-slate-800 bg-white/80 p-3.5 rounded-2xl border border-slate-200">
              <span className="font-heading font-bold text-slate-900 block mb-1">
                📖 Lời giải chi tiết:
              </span>
              <p className="font-medium text-slate-700">{currentQuestion.explanation}</p>
            </div>

            {/* Tutor Tip */}
            {currentQuestion.tutorTip && (
              <div className="text-xs leading-relaxed text-amber-950 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 font-medium">
                <span className="font-heading font-bold block mb-0.5 text-amber-900">
                  💡 Bí kíp của Cô Hồng Diệu:
                </span>
                <p>{currentQuestion.tutorTip}</p>
              </div>
            )}

            {/* Next Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                <span>
                  {currentIndex < filteredQuestions.length - 1
                    ? 'Làm câu tiếp theo'
                    : 'Xem kết quả tổng kết 🎉'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation bottom bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
        <button
          onClick={() => {
            sound.playPop();
            onBackToKnowledge();
          }}
          className="hover:text-indigo-600 font-bold transition-colors cursor-pointer"
        >
          ← Trở lại xem bài học
        </button>
        <span className="tabular-nums font-medium text-slate-600">
          Bài đang học: {lesson.title}
        </span>
      </div>
    </div>
  );
};
