import { ActiveExamSession, ExamResult, MistakeRecord } from '../types/quiz';

const STORAGE_KEYS = {
  ACTIVE_SESSION: 'sqa_active_exam_session_v1',
  HISTORY: 'sqa_exam_history_v1',
  MISTAKES: 'sqa_mistakes_v1',
  BOOKMARKS: 'sqa_bookmarks_v1',
  SETTINGS: 'sqa_settings_v1'
};

// ================= Active Session (Lưu bài dở dang) =================

export function saveActiveSession(session: ActiveExamSession): void {
  try {
    session.lastActiveAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save active session', err);
  }
}

export function getActiveSession(): ActiveExamSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw) as ActiveExamSession;
    if (session.isCompleted) return null;
    return session;
  } catch (err) {
    console.error('Failed to load active session', err);
    return null;
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  } catch (err) {
    console.error('Failed to clear active session', err);
  }
}

// ================= Exam History (Lịch sử làm bài) =================

export function getExamHistory(): ExamResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const list = JSON.parse(raw) as ExamResult[];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load history', err);
    return [];
  }
}

export function saveExamResult(result: ExamResult): void {
  try {
    const history = getExamHistory();
    // Keep last 50 attempts
    const updated = [result, ...history.filter(h => h.id !== result.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));

    // Also update mistakes bank
    recordMistakesFromResult(result);
  } catch (err) {
    console.error('Failed to save exam result', err);
  }
}

export function deleteExamResult(id: string): void {
  try {
    const history = getExamHistory().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to delete exam result', err);
  }
}

export function clearExamHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (err) {
    console.error('Failed to clear exam history', err);
  }
}

// ================= Mistakes Bank (Lưu câu hỏi làm sai) =================

export function getMistakeRecords(): Record<string, MistakeRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (err) {
    console.error('Failed to load mistakes', err);
    return {};
  }
}

export function recordMistakesFromResult(result: ExamResult): void {
  try {
    const mistakes = getMistakeRecords();

    for (const d of result.details) {
      if (!d.isCorrect && !d.isSkipped) {
        const qId = d.question.id;
        const existing = mistakes[qId];
        mistakes[qId] = {
          questionId: qId,
          wrongCount: (existing?.wrongCount || 0) + 1,
          lastWrongAt: Date.now(),
          lastUserAnswer: d.userAnswer ?? undefined,
          resolved: false
        };
      } else if (d.isCorrect) {
        // If user answered correctly in a later test, we can mark resolved or lower count
        const qId = d.question.id;
        if (mistakes[qId]) {
          mistakes[qId].resolved = true;
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  } catch (err) {
    console.error('Failed to record mistakes', err);
  }
}

export function resolveMistake(questionId: string): void {
  try {
    const mistakes = getMistakeRecords();
    if (mistakes[questionId]) {
      mistakes[questionId].resolved = true;
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
    }
  } catch (err) {
    console.error('Failed to resolve mistake', err);
  }
}

export function removeMistake(questionId: string): void {
  try {
    const mistakes = getMistakeRecords();
    delete mistakes[questionId];
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  } catch (err) {
    console.error('Failed to remove mistake', err);
  }
}

export function clearAllMistakes(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.MISTAKES);
  } catch (err) {
    console.error('Failed to clear mistakes', err);
  }
}

// ================= Bookmarks (Đánh dấu câu hỏi cần xem lại) =================

export function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Failed to load bookmarks', err);
    return [];
  }
}

export function toggleBookmarkStorage(questionId: string): boolean {
  try {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(questionId);
    let isNowBookmarked = false;
    if (index >= 0) {
      bookmarks.splice(index, 1);
      isNowBookmarked = false;
    } else {
      bookmarks.push(questionId);
      isNowBookmarked = true;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return isNowBookmarked;
  } catch (err) {
    console.error('Failed to toggle bookmark', err);
    return false;
  }
}
