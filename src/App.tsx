/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lesson, Question, QuizAttemptResult, StudentProfile } from './types';
import {
  getStoredLessons,
  saveStoredLessons,
  resetLessonsToDefault,
  getStudentProfile,
  recordQuizAttempt,
  isSoundEnabled,
  setSoundEnabled,
  saveStudentProfile,
} from './utils/storage';
import { sound } from './utils/sound';
import { Header } from './components/Header';
import { SelectorBar } from './components/SelectorBar';
import { KnowledgeTab } from './components/KnowledgeTab';
import { QuizPlayer } from './components/QuizPlayer';
import { TeacherEditor } from './components/TeacherEditor';
import { HistoryView } from './components/HistoryView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { BookOpen, HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Lessons data state
  const [lessons, setLessons] = useState<Lesson[]>(() => getStoredLessons());

  // Filter selection state: Default to Lớp 3, Tin học, Chủ đề 2 Bài 6 (from user's textbook)
  const [selectedGradeId, setSelectedGradeId] = useState<string>('lop-3');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('tinhoc');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('th3-bai-6-kham-pha-thong-tin-internet');

  // Views & tabs
  const [currentView, setCurrentView] = useState<'student' | 'teacher' | 'history'>('student');
  const [studentTab, setStudentTab] = useState<'knowledge' | 'quiz'>('knowledge');

  // Profile & audio settings
  const [profile, setProfile] = useState<StudentProfile>(() => getStudentProfile());
  const [soundActive, setSoundActive] = useState<boolean>(() => isSoundEnabled());

  // AI Modal
  const [aiQuestion, setAiQuestion] = useState<Question | null>(null);

  // Sync sound settings with audio synth
  useEffect(() => {
    sound.setEnabled(soundActive);
    setSoundEnabled(soundActive);
  }, [soundActive]);

  const toggleSound = () => {
    setSoundActive((prev) => !prev);
  };

  // Find the currently selected lesson
  const currentLesson: Lesson =
    lessons.find((l) => l.id === selectedLessonId) ||
    lessons.find((l) => l.gradeId === selectedGradeId && l.subjectId === selectedSubjectId) ||
    lessons[0];

  // If user picks a grade or subject that doesn't have the current lesson, update selectedLessonId
  const handleSelectGrade = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    const matching = lessons.find(
      (l) => l.gradeId === gradeId && l.subjectId === selectedSubjectId
    );
    if (matching) {
      setSelectedLessonId(matching.id);
    }
  };

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const matching = lessons.find(
      (l) => l.gradeId === selectedGradeId && l.subjectId === subjectId
    );
    if (matching) {
      setSelectedLessonId(matching.id);
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const found = lessons.find((l) => l.id === lessonId);
    if (found) {
      setSelectedGradeId(found.gradeId);
      setSelectedSubjectId(found.subjectId);
    }
    // Switch to knowledge overview when picking a new lesson
    setStudentTab('knowledge');
    if (currentView === 'history') {
      setCurrentView('student');
    }
  };

  // Handle saving modified lessons by Teacher
  const handleSaveLessons = (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
    saveStoredLessons(updatedLessons);
  };

  const handleResetDefaults = () => {
    const defaults = resetLessonsToDefault();
    setLessons(defaults);
    setSelectedLessonId(defaults[0].id);
    setSelectedGradeId(defaults[0].gradeId);
    setSelectedSubjectId(defaults[0].subjectId);
  };

  // Handle recording quiz attempt
  const handleCompleteAttempt = (result: QuizAttemptResult) => {
    const updatedProfile = recordQuizAttempt(result);
    setProfile(updatedProfile);
  };

  const handleUpdateStudentName = (name: string) => {
    const updated = {
      ...profile,
      name,
    };
    saveStudentProfile(updated);
    setProfile(updated);
  };

  const handleClearHistory = () => {
    const cleared: StudentProfile = {
      ...profile,
      history: [],
    };
    saveStudentProfile(cleared);
    setProfile(cleared);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'student') setStudentTab('knowledge');
        }}
        profile={profile}
        soundEnabled={soundActive}
        onToggleSound={toggleSound}
        activeLessonTitle={currentLesson?.title}
      />

      {/* 2. Top Selector (Chọn lớp, môn học, bài học) in Student View */}
      {currentView === 'student' && (
        <SelectorBar
          selectedGradeId={selectedGradeId}
          onSelectGrade={handleSelectGrade}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={handleSelectSubject}
          lessons={lessons}
          selectedLessonId={currentLesson?.id || ''}
          onSelectLesson={handleSelectLesson}
          completedLessonIds={profile.completedLessons}
        />
      )}

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* STUDENT VIEW */}
        {currentView === 'student' && currentLesson && (
          <div className="space-y-6">
            {/* Student Mode Dual Tabs: 📖 Kiến thức cần nhớ VS ✍️ Luyện tập câu hỏi */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl">
                <button
                  onClick={() => setStudentTab('knowledge')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    studentTab === 'knowledge'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  1. Kiến thức cần nhớ & Ghi nhớ nhanh
                </button>

                <button
                  onClick={() => setStudentTab('quiz')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    studentTab === 'quiz'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  2. Luyện tập câu hỏi ({currentLesson.questions.length} câu)
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
                <span>Khối {currentLesson.gradeId.replace('lop-', 'Lớp ')}</span>
                <span>·</span>
                <span>{currentLesson.bookSeries}</span>
              </div>
            </div>

            {/* TAB 1: KNOWLEDGE OVERVIEW */}
            {studentTab === 'knowledge' && (
              <KnowledgeTab
                lesson={currentLesson}
                onStartQuiz={() => setStudentTab('quiz')}
              />
            )}

            {/* TAB 2: INTERACTIVE QUIZ ENGINE */}
            {studentTab === 'quiz' && (
              <QuizPlayer
                lesson={currentLesson}
                studentName={profile.name}
                onUpdateStudentName={handleUpdateStudentName}
                onBackToKnowledge={() => setStudentTab('knowledge')}
                onCompleteAttempt={handleCompleteAttempt}
                onAskAI={(q) => setAiQuestion(q)}
              />
            )}
          </div>
        )}

        {/* TEACHER MODE (SOẠN BÀI & CHỈNH SỬA) */}
        {currentView === 'teacher' && (
          <TeacherEditor
            lessons={lessons}
            currentLessonId={currentLesson?.id || lessons[0].id}
            onSaveLessons={handleSaveLessons}
            onResetDefaults={handleResetDefaults}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {/* HISTORY & RESULTS VIEW */}
        {currentView === 'history' && (
          <HistoryView
            profile={profile}
            lessons={lessons}
            onSelectLesson={handleSelectLesson}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* 4. AI Tutor Assistant Modal */}
      {aiQuestion && currentLesson && (
        <AIAssistantModal
          question={aiQuestion}
          lessonTitle={currentLesson.title}
          onClose={() => setAiQuestion(null)}
        />
      )}

      {/* 5. Minimal Footer */}
      <footer className="mt-auto border-t border-indigo-100 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            © 2026 GIA SƯ TIN HỌC LỚP 3 — GIÁO VIÊN: HỒNG DIỆU
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="text-rose-600 font-bold">♥ Dành cho học sinh Tiểu học</span>
            <span>·</span>
            <span>Bộ sách Kết nối tri thức với cuộc sống</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
