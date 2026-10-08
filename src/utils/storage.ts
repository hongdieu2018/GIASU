import { DEFAULT_LESSONS } from '../data/defaultLessons';
import { Lesson, QuizAttemptResult, StudentProfile } from '../types';

const LESSONS_KEY = 'giasutinhoc3_lessons_v7_chude2_kntt';
const PROFILE_KEY = 'giasutinhoc3_profile_v3';
const AUDIO_KEY = 'giasutinhoc3_sound_enabled';

export function getStoredLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    if (!raw) {
      saveStoredLessons(DEFAULT_LESSONS);
      return DEFAULT_LESSONS;
    }
    const parsed = JSON.parse(raw);
    // Validate: must be an array, all lessons must belong to 'tinhoc', and must have all chapter 1 lessons
    if (
      !Array.isArray(parsed) ||
      parsed.length < DEFAULT_LESSONS.length ||
      parsed.some((l) => l.subjectId !== 'tinhoc')
    ) {
      saveStoredLessons(DEFAULT_LESSONS);
      return DEFAULT_LESSONS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read lessons from localStorage:', err);
    return DEFAULT_LESSONS;
  }
}

export function saveStoredLessons(lessons: Lesson[]): void {
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  } catch (err) {
    console.error('Failed to save lessons to localStorage:', err);
  }
}

export function resetLessonsToDefault(): Lesson[] {
  try {
    localStorage.removeItem(LESSONS_KEY);
    saveStoredLessons(DEFAULT_LESSONS);
  } catch (err) {
    console.error('Failed to reset lessons:', err);
  }
  return DEFAULT_LESSONS;
}

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Học sinh chăm chỉ',
  stars: 50,
  completedLessons: [],
  history: [],
};

export function getStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      saveStudentProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || DEFAULT_PROFILE.name,
      stars: typeof parsed.stars === 'number' ? parsed.stars : DEFAULT_PROFILE.stars,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function recordQuizAttempt(result: QuizAttemptResult): StudentProfile {
  const profile = getStudentProfile();
  
  // Stars calculation: 1 star per 10 points
  const earnedStars = Math.floor(result.totalScore / 10);
  const updatedStars = (profile.stars || 0) + earnedStars;

  const completed = new Set(Array.isArray(profile.completedLessons) ? profile.completedLessons : []);
  if (result.correctCount / Math.max(1, result.totalCount) >= 0.7) {
    completed.add(result.lessonId);
  }

  const existingHistory = Array.isArray(profile.history) ? profile.history : [];
  const updatedProfile: StudentProfile = {
    ...profile,
    name: result.studentName?.trim() || profile.name,
    stars: updatedStars,
    completedLessons: Array.from(completed),
    history: [result, ...existingHistory.slice(0, 49)], // keep last 50 attempts
  };

  saveStudentProfile(updatedProfile);
  return updatedProfile;
}

export function isSoundEnabled(): boolean {
  const val = localStorage.getItem(AUDIO_KEY);
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUDIO_KEY, String(enabled));
  } catch (err) {
    console.error('Failed to save sound preference:', err);
  }
}
