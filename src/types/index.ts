export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type QuestionType = 'single_choice' | 'text_input' | 'true_false' | 'multiple_choice';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  difficulty: DifficultyLevel; // easy: Dễ (Nhận biết), medium: Vừa (Thông hiểu), hard: Khó (Vận dụng), expert: Thử thách (Vận dụng cao)
  type: QuestionType;
  prompt: string;
  contextSnippet?: string; // Tình huống từ bài học / SGK
  options?: QuestionOption[];
  correctAnswer: string | string[]; // ID đáp án hoặc danh sách từ khoá/câu đúng
  explanation: string; // Lời giải chi tiết
  tutorTip?: string; // Mẹo nhớ lâu của Gia sư
  points: number;
}

export interface DetailedNote {
  id: string;
  title: string;
  content: string;
  highlight?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  visualType?: 'badge' | 'table' | 'diagram' | 'quote' | 'box';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tip?: string;
}

export interface Lesson {
  id: string;
  gradeId: string; // 'lop-1'..'lop-12'
  subjectId: string; // 'tinhoc', 'toan', 'tiengviet', 'khoahoc', 'tienganh'...
  lessonNumber: number;
  title: string; // "Bài 1: Thông tin và quyết định"
  unit: string; // "Chủ đề 1: Máy tính và em"
  bookSeries: string; // "Kết nối tri thức với cuộc sống"
  objectives: string[]; // Sau bài này em sẽ:
  summaryPoints: string[]; // Ghi nhớ trọng tâm
  detailedNotes: DetailedNote[];
  flashcards: Flashcard[];
  questions: Question[];
  updatedAt?: number;
}

export interface Subject {
  id: string;
  name: string;
  iconName: string;
  description: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    light: string;
    accent: string;
  };
}

export interface Grade {
  id: string;
  name: string;
  stage: 'primary' | 'secondary' | 'high';
}

export interface QuizAttemptResult {
  lessonId: string;
  timestamp: number;
  totalScore: number;
  maxScore: number;
  correctCount: number;
  totalCount: number;
  timeSpentSeconds: number;
  studentName?: string;
  selectedLevel?: string;
  answers: Record<string, {
    userAnswer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
  }>;
}

export interface StudentProfile {
  name: string;
  stars: number;
  completedLessons: string[]; // lesson ids
  history: QuizAttemptResult[];
}
