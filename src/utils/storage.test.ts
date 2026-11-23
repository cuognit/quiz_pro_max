import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveActiveSession,
  getActiveSession,
  clearActiveSession,
  saveExamResult,
  getExamHistory,
  deleteExamResult,
  clearExamHistory,
  getMistakeRecords,
  recordMistakesFromResult,
  resolveMistake,
  removeMistake,
  clearAllMistakes,
  getBookmarks,
  toggleBookmarkStorage
} from './storage';
import { ActiveExamSession, ExamResult, Question } from '../types/quiz';

// Mock localStorage for Node test environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
  get length(): number {
    return Object.keys(this.store).length;
  }
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

const mockStorage = new LocalStorageMock();
(globalThis as any).localStorage = mockStorage;

// Helpers
function createMockQuestion(id: string): Question {
  return {
    id,
    code: id.replace('q', ''),
    group: 1,
    groupName: 'Group 1',
    cdr: 'CĐR 1.1',
    difficulty: 'DỄ',
    topic: 'Topic 1',
    question: `Sample question ${id}`,
    options: [
      { id: 1, label: 'A', text: 'Opt 1' },
      { id: 2, label: 'B', text: 'Opt 2' },
      { id: 3, label: 'C', text: 'Opt 3' },
      { id: 4, label: 'D', text: 'Opt 4' }
    ],
    correctOption: 1
  };
}

test('ActiveSession: saves, updates timestamp, retrieves, and clears successfully', () => {
  mockStorage.clear();
  assert.equal(getActiveSession(), null);

  const session: ActiveExamSession = {
    id: 'session_001',
    config: {
      mode: 'custom',
      title: 'Thi thử Big Data',
      questionCount: 40,
      durationMinutes: 45,
      selectedGroups: [],
      selectedCdrs: [],
      selectedDifficulties: [],
      shuffleQuestions: true,
      shuffleOptions: true,
      immediateFeedback: false
    },
    questions: [createMockQuestion('q1'), createMockQuestion('q2')],
    userAnswers: { q1: 1 },
    flaggedQuestions: { q2: true },
    startedAt: 1000,
    totalDurationSeconds: 2700,
    remainingSeconds: 2500,
    lastActiveAt: 1000,
    currentQuestionIndex: 1,
    isCompleted: false
  };

  saveActiveSession(session);
  const loaded = getActiveSession();
  assert.ok(loaded);
  assert.equal(loaded.id, 'session_001');
  assert.equal(loaded.userAnswers.q1, 1);
  assert.equal(loaded.flaggedQuestions.q2, true);
  assert.ok(loaded.lastActiveAt >= 1000);

  // If completed, getActiveSession returns null
  session.isCompleted = true;
  saveActiveSession(session);
  assert.equal(getActiveSession(), null);

  clearActiveSession();
  assert.equal(getActiveSession(), null);
});

test('ExamHistory: saves results, deduplicates by id, respects cap of 50, and clears', () => {
  mockStorage.clear();
  assert.deepEqual(getExamHistory(), []);

  const sampleResult: ExamResult = {
    id: 'res_001',
    title: 'Bài thi thử số 1',
    mode: 'custom',
    completedAt: 2000,
    totalDurationSeconds: 1200,
    totalQuestions: 10,
    gradedQuestions: 10,
    discussionCount: 0,
    correctCount: 8,
    partialCount: 0,
    incorrectCount: 1,
    skippedCount: 1,
    earnedPoints: 8,
    score10: 8.0,
    percentage: 80,
    passed: true,
    timeSpentSeconds: 1000,
    breakdownByGroup: {},
    breakdownByCdr: {},
    breakdownByDifficulty: {},
    breakdownByTopic: {},
    details: []
  };

  saveExamResult(sampleResult);
  let history = getExamHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].id, 'res_001');

  // Overwriting same ID updates entry rather than creating duplicate
  sampleResult.score10 = 9.0;
  saveExamResult(sampleResult);
  history = getExamHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].score10, 9.0);

  // Delete specific result
  deleteExamResult('res_001');
  assert.equal(getExamHistory().length, 0);

  // Add multiple items up to limit
  for (let i = 1; i <= 60; i++) {
    saveExamResult({ ...sampleResult, id: `res_${i}` });
  }
  history = getExamHistory();
  assert.equal(history.length, 50, 'History must be capped at 50 attempts');

  clearExamHistory();
  assert.deepEqual(getExamHistory(), []);
});

test('MistakesBank: records wrong answers, resolves when corrected, and deletes', () => {
  mockStorage.clear();
  assert.deepEqual(getMistakeRecords(), {});

  const q1 = createMockQuestion('q1');
  const q2 = createMockQuestion('q2');

  const result: ExamResult = {
    id: 'res_mistakes',
    title: 'Test Mistakes',
    mode: 'custom',
    completedAt: 2000,
    totalDurationSeconds: 600,
    totalQuestions: 2,
    gradedQuestions: 2,
    discussionCount: 0,
    correctCount: 0,
    partialCount: 0,
    incorrectCount: 2,
    skippedCount: 0,
    earnedPoints: 0,
    score10: 0,
    percentage: 0,
    passed: false,
    timeSpentSeconds: 100,
    breakdownByGroup: {},
    breakdownByCdr: {},
    breakdownByDifficulty: {},
    breakdownByTopic: {},
    details: [
      {
        question: q1,
        userAnswer: 2, // wrong (correct is 1)
        userAnswersList: [2],
        correctAnswer: 1,
        correctAnswersList: [1],
        scoreRatio: 0,
        isCorrect: false,
        isSkipped: false
      },
      {
        question: q2,
        userAnswer: 3, // wrong (correct is 1)
        userAnswersList: [3],
        correctAnswer: 1,
        correctAnswersList: [1],
        scoreRatio: 0,
        isCorrect: false,
        isSkipped: false
      }
    ]
  };

  recordMistakesFromResult(result);
  let mistakes = getMistakeRecords();
  assert.ok(mistakes['q1']);
  assert.equal(mistakes['q1'].wrongCount, 1);
  assert.equal(mistakes['q1'].resolved, false);
  assert.equal(mistakes['q1'].lastUserAnswer, 2);

  // Answering wrong again increments wrongCount
  recordMistakesFromResult(result);
  mistakes = getMistakeRecords();
  assert.equal(mistakes['q1'].wrongCount, 2);

  // Resolving mistake
  resolveMistake('q1');
  mistakes = getMistakeRecords();
  assert.equal(mistakes['q1'].resolved, true);

  // Answering correctly in next exam marks it resolved
  const nextResult: ExamResult = {
    ...result,
    id: 'res_next',
    details: [
      {
        question: q2,
        userAnswer: 1, // now correct!
        userAnswersList: [1],
        correctAnswer: 1,
        correctAnswersList: [1],
        scoreRatio: 1,
        isCorrect: true,
        isSkipped: false
      }
    ]
  };
  recordMistakesFromResult(nextResult);
  mistakes = getMistakeRecords();
  assert.equal(mistakes['q2'].resolved, true);

  // Removing specific mistake & clear all
  removeMistake('q1');
  assert.equal(getMistakeRecords()['q1'], undefined);

  clearAllMistakes();
  assert.deepEqual(getMistakeRecords(), {});
});

test('Bookmarks: toggles bookmark on and off reliably', () => {
  mockStorage.clear();
  assert.deepEqual(getBookmarks(), []);

  const isMarked1 = toggleBookmarkStorage('q100');
  assert.equal(isMarked1, true);
  assert.deepEqual(getBookmarks(), ['q100']);

  const isMarked2 = toggleBookmarkStorage('q101');
  assert.equal(isMarked2, true);
  assert.equal(getBookmarks().length, 2);

  // Toggling q100 off
  const isMarked3 = toggleBookmarkStorage('q100');
  assert.equal(isMarked3, false);
  assert.deepEqual(getBookmarks(), ['q101']);
});
