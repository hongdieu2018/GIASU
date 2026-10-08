import React, { useState } from 'react';
import { GRADES, SUBJECTS } from '../data/defaultLessons';
import { DifficultyLevel, Lesson, Question, QuestionType } from '../types';
import {
  Save,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TeacherEditorProps {
  lessons: Lesson[];
  currentLessonId: string;
  onSaveLessons: (updatedLessons: Lesson[]) => void;
  onResetDefaults: () => void;
  onSelectLesson: (id: string) => void;
}

export const TeacherEditor: React.FC<TeacherEditorProps> = ({
  lessons,
  currentLessonId,
  onSaveLessons,
  onResetDefaults,
  onSelectLesson,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(() => {
    return lessons.find((l) => l.id === currentLessonId) || lessons[0];
  });

  const [activeTab, setActiveTab] = useState<'info' | 'summary' | 'questions'>('questions');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync when currentLessonId changes from outside
  const handleSwitchLesson = (id: string) => {
    const found = lessons.find((l) => l.id === id);
    if (found) {
      setSelectedLesson(JSON.parse(JSON.stringify(found)));
      onSelectLesson(id);
    }
  };

  // Create a new blank lesson
  const handleCreateNewLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-custom-${Date.now()}`,
      gradeId: 'lop-3',
      subjectId: 'tinhoc',
      lessonNumber: lessons.length + 1,
      title: 'Bài mới: Tên bài học...',
      unit: 'Chủ đề mới',
      bookSeries: 'Kết nối tri thức với cuộc sống',
      objectives: ['Nêu được khái niệm cơ bản', 'Vận dụng giải bài tập thực tế'],
      summaryPoints: [
        'Ý trọng tâm số 1...',
        'Ý trọng tâm số 2...',
      ],
      detailedNotes: [],
      flashcards: [
        {
          id: `fc-${Date.now()}`,
          front: 'Khái niệm chính của bài là gì?',
          back: 'Đáp án tóm tắt ghi nhớ...',
          tip: 'Mẹo ghi nhớ...',
        },
      ],
      questions: [
        {
          id: `q-${Date.now()}`,
          difficulty: 'easy',
          type: 'single_choice',
          prompt: 'Câu hỏi nhận biết đầu tiên...',
          options: [
            { id: 'A', text: 'Lựa chọn A' },
            { id: 'B', text: 'Lựa chọn B' },
            { id: 'C', text: 'Lựa chọn C' },
            { id: 'D', text: 'Lựa chọn D' },
          ],
          correctAnswer: 'A',
          explanation: 'Lời giải chi tiết giải thích vì sao A đúng...',
          tutorTip: 'Mẹo ghi nhớ nhanh của gia sư...',
          points: 10,
        },
      ],
    };

    const updated = [newLesson, ...lessons];
    setSelectedLesson(newLesson);
    onSaveLessons(updated);
    onSelectLesson(newLesson.id);
  };

  // Save current editing lesson to global state
  const handleSaveCurrentLesson = () => {
    const updated = lessons.map((l) =>
      l.id === selectedLesson.id ? { ...selectedLesson, updatedAt: Date.now() } : l
    );
    // If not found in list, append it
    if (!lessons.some((l) => l.id === selectedLesson.id)) {
      updated.unshift(selectedLesson);
    }

    onSaveLessons(updated);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2500);
  };

  // Delete current lesson
  const handleDeleteCurrentLesson = () => {
    if (lessons.length <= 1) {
      notify('Phải giữ lại ít nhất 1 bài học trong hệ thống.', 'error');
      return;
    }
    setConfirmDialog({
      title: 'Xác nhận xóa bài học',
      message: `Thầy/Cô có chắc chắn muốn xóa bài học "${selectedLesson.title}"?`,
      onConfirm: () => {
        const remaining = lessons.filter((l) => l.id !== selectedLesson.id);
        onSaveLessons(remaining);
        setSelectedLesson(remaining[0]);
        onSelectLesson(remaining[0].id);
        notify('Đã xóa bài học thành công.', 'info');
      },
    });
  };

  // Add question
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      difficulty: 'easy',
      type: 'single_choice',
      prompt: 'Nhập nội dung câu hỏi mới ở đây...',
      options: [
        { id: 'A', text: 'Lựa chọn A' },
        { id: 'B', text: 'Lựa chọn B' },
        { id: 'C', text: 'Lựa chọn C' },
        { id: 'D', text: 'Lựa chọn D' },
      ],
      correctAnswer: 'A',
      explanation: 'Lời giải thích cặn kẽ để học sinh hiểu bài...',
      tutorTip: 'Mẹo nhớ lâu của Gia sư...',
      points: 10,
    };

    setSelectedLesson({
      ...selectedLesson,
      questions: [...selectedLesson.questions, newQ],
    });
    setEditingQuestionId(newQ.id);
  };

  // Delete question
  const handleDeleteQuestion = (qId: string) => {
    if (selectedLesson.questions.length <= 1) {
      notify('Bài học cần có ít nhất 1 câu hỏi.', 'error');
      return;
    }
    setSelectedLesson({
      ...selectedLesson,
      questions: selectedLesson.questions.filter((q) => q.id !== qId),
    });
    if (editingQuestionId === qId) {
      setEditingQuestionId(null);
    }
    notify('Đã xóa câu hỏi.', 'info');
  };

  // Update question field
  const handleUpdateQuestion = (qId: string, updates: Partial<Question>) => {
    setSelectedLesson({
      ...selectedLesson,
      questions: selectedLesson.questions.map((q) =>
        q.id === qId ? { ...q, ...updates } : q
      ),
    });
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lessons, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `giasuthongminh_hoclieu_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onSaveLessons(parsed);
            setSelectedLesson(parsed[0]);
            onSelectLesson(parsed[0].id);
            notify('Nhập dữ liệu bài học thành công!', 'success');
          } else {
            notify('File JSON không đúng định dạng bài học!', 'error');
          }
        } catch {
          notify('Không thể đọc file JSON.', 'error');
        }
      };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar for Teacher Mode */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider block">
            Bảng điều khiển Giáo viên: Hồng Diệu
          </span>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
            Biên soạn & Chỉnh sửa học liệu Tin học lớp 3
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Tùy biến câu hỏi, phân hóa thang điểm từ Dễ đến Khó và cập nhật kiến thức SGK.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveCurrentLesson}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu bài học
          </button>

          <button
            onClick={handleCreateNewLesson}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Tạo bài mới
          </button>

          <button
            onClick={handleExportJSON}
            title="Xuất học liệu ra file JSON để lưu trữ"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            title="Nhập học liệu từ file JSON"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={() => {
              setConfirmDialog({
                title: 'Khôi phục bài học SGK',
                message: 'Thầy/Cô có chắc chắn muốn khôi phục về dữ liệu bài học mẫu chuẩn SGK ban đầu?',
                onConfirm: () => {
                  onResetDefaults();
                  notify('Đã khôi phục dữ liệu SGK mẫu ban đầu!', 'success');
                },
              });
            }}
            title="Khôi phục dữ liệu bài học SGK ban đầu"
            className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-lg border text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-950 border-rose-300'
              : 'bg-indigo-50 text-indigo-950 border-indigo-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Confirm Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-slate-900 font-heading font-extrabold text-base">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{confirmDialog.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  action();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Đã lưu bài học vào trình duyệt thành công! Học sinh có thể làm bài ngay.
        </div>
      )}

      {/* Select active lesson to edit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Chọn bài học cần chỉnh sửa:
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={selectedLesson.id}
            onChange={(e) => handleSwitchLesson(e.target.value)}
            className="w-full sm:flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                [{GRADES.find((g) => g.id === l.gradeId)?.name || l.gradeId} -{' '}
                {SUBJECTS.find((s) => s.id === l.subjectId)?.name || l.subjectId}] {l.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleDeleteCurrentLesson}
            className="w-full sm:w-auto px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Xóa bài này
          </button>
        </div>
      </div>

      {/* Navigation tabs within Editor */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl max-w-fit">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'questions'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Câu hỏi ôn tập ({selectedLesson.questions.length})
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'summary'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kiến thức cần nhớ
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'info'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Thông tin chung
        </button>
      </div>

      {/* TAB 1: QUESTIONS MANAGEMENT */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Danh sách câu hỏi ôn tập của bài
            </h3>
            <button
              onClick={handleAddQuestion}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm câu hỏi mới
            </button>
          </div>

          <div className="space-y-3">
            {selectedLesson.questions.map((q, idx) => {
              const isEditing = editingQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-indigo-700">
                        {q.difficulty === 'easy' && '⭐ Dễ (Nhận biết)'}
                        {q.difficulty === 'medium' && '⭐⭐ Vừa (Thông hiểu)'}
                        {q.difficulty === 'hard' && '⭐⭐⭐ Khó (Vận dụng)'}
                        {q.difficulty === 'expert' && '⭐⭐⭐⭐ Thử thách (Vận dụng cao)'}
                      </span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        +{q.points} điểm
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        {isEditing ? 'Thu gọn' : 'Chỉnh sửa'}
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary row when collapsed */}
                  {!isEditing && (
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">
                        {q.prompt}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Đáp án đúng: <span className="font-bold text-emerald-600">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</span>
                      </p>
                    </div>
                  )}

                  {/* Edit Form when expanded */}
                  {isEditing && (
                    <div className="space-y-4 pt-2 text-xs">
                      {/* Difficulty and Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Mức độ câu hỏi:
                          </label>
                          <select
                            value={q.difficulty}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                difficulty: e.target.value as DifficultyLevel,
                              })
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          >
                            <option value="easy">Dễ (Nhận biết)</option>
                            <option value="medium">Vừa (Thông hiểu)</option>
                            <option value="hard">Khó (Vận dụng)</option>
                            <option value="expert">Thử thách (Vận dụng cao)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Loại câu hỏi:
                          </label>
                          <select
                            value={q.type}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                type: e.target.value as QuestionType,
                              })
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          >
                            <option value="single_choice">Trắc nghiệm 1 đáp án</option>
                            <option value="text_input">Điền từ / Tự luận ngắn</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Điểm số:
                          </label>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                points: Number(e.target.value) || 10,
                              })
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* Question Prompt */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Nội dung câu hỏi:
                        </label>
                        <textarea
                          rows={2}
                          value={q.prompt}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { prompt: e.target.value })
                          }
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>

                      {/* Context snippet if any */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Tình huống dẫn chứng / Ngữ cảnh SGK (Tùy chọn):
                        </label>
                        <input
                          type="text"
                          value={q.contextSnippet || ''}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, {
                              contextSnippet: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Tình huống bạn Khoa đưa áo mưa cho mẹ..."
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      {/* Options if single_choice */}
                      {q.type === 'single_choice' && (
                        <div className="space-y-2">
                          <label className="block font-bold text-slate-700">
                            Các phương án lựa chọn và Đánh dấu đáp án đúng:
                          </label>
                          {q.options?.map((opt, oIdx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <span className="w-6 font-bold text-center text-slate-600">
                                {opt.id}.
                              </span>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const newOptions = [...(q.options || [])];
                                  newOptions[oIdx] = { ...opt, text: e.target.value };
                                  handleUpdateQuestion(q.id, { options: newOptions });
                                }}
                                className="flex-1 p-2 border border-slate-300 rounded-lg text-xs"
                              />
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  checked={q.correctAnswer === opt.id}
                                  onChange={() =>
                                    handleUpdateQuestion(q.id, {
                                      correctAnswer: opt.id,
                                    })
                                  }
                                />
                                <span className="text-[11px] font-semibold text-slate-600">
                                  Đúng
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Correct answer if text_input */}
                      {q.type === 'text_input' && (
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Đáp án đúng (ngăn cách các đáp án tương đương bằng dấu phẩy):
                          </label>
                          <input
                            type="text"
                            value={
                              Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.join(', ')
                                : q.correctAnswer
                            }
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                correctAnswer: e.target.value
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Ví dụ: hình ảnh, bức ảnh, tranh ảnh"
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      )}

                      {/* Explanation */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Lời giải chi tiết:
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { explanation: e.target.value })
                          }
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      {/* Tutor Tip */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Bí kíp / Mẹo nhớ lâu của Gia sư:
                        </label>
                        <input
                          type="text"
                          value={q.tutorTip || ''}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { tutorTip: e.target.value })
                          }
                          placeholder="Ví dụ: Nhớ công thức Thông tin -> Suy nghĩ -> Quyết định..."
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SUMMARY & OBJECTIVES */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">
            Biên soạn Kiến thức cần nhớ & Mục tiêu
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mục tiêu bài học (&ldquo;Sau bài này em sẽ...&rdquo; - Mỗi mục một dòng):
            </label>
            <textarea
              rows={3}
              value={selectedLesson.objectives.join('\n')}
              onChange={(e) =>
                setSelectedLesson({
                  ...selectedLesson,
                  objectives: e.target.value.split('\n').filter(Boolean),
                })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Các điểm ghi nhớ cốt lõi (Mỗi ý một dòng):
            </label>
            <textarea
              rows={4}
              value={selectedLesson.summaryPoints.join('\n')}
              onChange={(e) =>
                setSelectedLesson({
                  ...selectedLesson,
                  summaryPoints: e.target.value.split('\n').filter(Boolean),
                })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
          </div>
        </div>
      )}

      {/* TAB 3: GENERAL INFO */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">
            Thông tin định danh bài học
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
              <select
                value={selectedLesson.gradeId}
                onChange={(e) =>
                  setSelectedLesson({ ...selectedLesson, gradeId: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                {GRADES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Môn học:</label>
              <select
                value={selectedLesson.subjectId}
                onChange={(e) =>
                  setSelectedLesson({ ...selectedLesson, subjectId: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên bài học:</label>
            <input
              type="text"
              value={selectedLesson.title}
              onChange={(e) =>
                setSelectedLesson({ ...selectedLesson, title: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chủ đề / Chương:</label>
              <input
                type="text"
                value={selectedLesson.unit}
                onChange={(e) =>
                  setSelectedLesson({ ...selectedLesson, unit: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bộ sách giáo khoa:</label>
              <input
                type="text"
                value={selectedLesson.bookSeries}
                onChange={(e) =>
                  setSelectedLesson({ ...selectedLesson, bookSeries: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
