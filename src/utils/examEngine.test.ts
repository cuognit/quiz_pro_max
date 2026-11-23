import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateCustomExam,
  calculateExamResult,
  evaluateQuestionAnswer,
  formatTime,
  getGradeEvaluation
} from './examEngine';
import { Question, ActiveExamSession } from '../types/quiz';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Big Data questions across 5 Batches
const mockQuestions: Question[] = [];
for (let g = 1; g <= 5; g++) {
  for (let i = 1; i <= 15; i++) {
    mockQuestions.push({
      id: `bd_${g}_${i}`,
      code: `${g}-${i}`,
      group: g,
      groupName: `Batch ${g}`,
      cdr: g === 1 ? 'CĐR 1.1' : g === 2 ? 'CĐR 2.1' : g === 3 ? 'CĐR 3.1' : 'Thực hành',
      difficulty: i <= 5 ? 'DỄ' : i <= 12 ? 'TRUNG BÌNH' : 'KHÓ',
      topic: 'Apache Spark',
      question: `Câu hỏi Big Data mẫu ${g}-${i}`,
      options: [
        { id: 1, label: 'A', text: 'Đáp án A' },
        { id: 2, label: 'B', text: 'Đáp án B' },
        { id: 3, label: 'C', text: 'Đáp án C' },
        { id: 4, label: 'D', text: 'Đáp án D' }
      ],
      correctOption: 2,
      correctOptions: [2],
      isMultiSelect: false,
      isDiscussion: false
    });
  }
}

test('generateCustomExam respects questionCount and batch/CDR filters', () => {
  const custom = generateCustomExam(mockQuestions, {
    mode: 'custom',
    title: 'Custom Big Data Test',
    questionCount: 15,
    durationMinutes: 20,
    selectedGroups: [1, 2],
    selectedCdrs: [],
    selectedDifficulties: [],
    shuffleQuestions: true,
    shuffleOptions: false,
    immediateFeedback: false
  });

  assert.equal(custom.length, 15);
  for (const q of custom) {
    assert.ok(q.group === 1 || q.group === 2);
  }
});

test('evaluateQuestionAnswer supports multi-select partial credit and prevents all-4 cheating', () => {
  const multiQ: Question = {
    ...mockQuestions[0],
    id: 'multi_1',
    correctOption: 1,
    correctOptions: [1, 2, 4],
    isMultiSelect: true
  };

  // Exact match -> 1.0
  const exact = evaluateQuestionAnswer(multiQ, [1, 2, 4]);
  assert.equal(exact.scoreRatio, 1);
  assert.equal(exact.isCorrect, true);
  assert.equal(exact.isPartial, false);

  // 2 out of 3 correct, 0 wrong -> 0.67 partial
  const partial2of3 = evaluateQuestionAnswer(multiQ, [1, 4]);
  assert.equal(partial2of3.scoreRatio, 0.67);
  assert.equal(partial2of3.isCorrect, false);
  assert.equal(partial2of3.isPartial, true);

  // 2 correct + 1 wrong -> (2 - 1)/3 = 0.33 partial
  const partialPenalized = evaluateQuestionAnswer(multiQ, [1, 2, 3]);
  assert.equal(partialPenalized.scoreRatio, 0.33);
  assert.equal(partialPenalized.isPartial, true);

  // 1 correct + 1 wrong -> (1 - 1)/3 = 0
  const zeroScore = evaluateQuestionAnswer(multiQ, [1, 3]);
  assert.equal(zeroScore.scoreRatio, 0);
  assert.equal(zeroScore.isPartial, false);
});

test('calculateExamResult excludes discussion questions from denominator and applies partial credit', () => {
  const q1: Question = { ...mockQuestions[0], id: 'q_single_ok', correctOption: 2, correctOptions: [2] };
  const q2: Question = {
    ...mockQuestions[1],
    id: 'q_multi_partial',
    correctOption: 1,
    correctOptions: [1, 2],
    isMultiSelect: true
  };
  const q3: Question = {
    ...mockQuestions[2],
    id: 'q_discussion',
    correctOption: 0,
    correctOptions: [],
    isDiscussion: true
  };

  const session: ActiveExamSession = {
    id: 'test_session_partial_disc',
    config: {
      mode: 'custom',
      title: 'Bài thi Big Data',
      questionCount: 3,
      durationMinutes: 15,
      selectedGroups: [1],
      selectedCdrs: [],
      selectedDifficulties: [],
      shuffleQuestions: false,
      shuffleOptions: false,
      immediateFeedback: false
    },
    questions: [q1, q2, q3],
    userAnswers: {
      q_single_ok: 2, // 1.0 pt
      q_multi_partial: [1], // 0.5 pt (1 of 2)
      q_discussion: 4 // excluded from grading
    },
    flaggedQuestions: {},
    startedAt: 100000,
    totalDurationSeconds: 900,
    remainingSeconds: 300,
    lastActiveAt: 100600,
    currentQuestionIndex: 0,
    isCompleted: false
  };

  const result = calculateExamResult(session);

  assert.equal(result.totalQuestions, 3);
  assert.equal(result.gradedQuestions, 2);
  assert.equal(result.discussionCount, 1);
  assert.equal(result.correctCount, 1);
  assert.equal(result.partialCount, 1);
  assert.equal(result.incorrectCount, 0);
  assert.equal(result.skippedCount, 0);
  assert.equal(result.earnedPoints, 1.5);
  assert.equal(result.score10, 7.5); // 1.5 / 2 * 10 = 7.5
  assert.equal(result.percentage, 75);
  assert.equal(result.passed, true);
  assert.equal(result.timeSpentSeconds, 600);
});

test('formatTime properly formats seconds to MM:SS and HH:MM:SS', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(3600), '01:00:00');
  assert.equal(formatTime(3665), '01:01:05');
});

test('getGradeEvaluation assigns correct tiers', () => {
  assert.equal(getGradeEvaluation(9.5).grade, 'A+');
  assert.equal(getGradeEvaluation(8.2).grade, 'A');
  assert.equal(getGradeEvaluation(7.5).grade, 'B+');
  assert.equal(getGradeEvaluation(5.0).grade, 'C');
  assert.equal(getGradeEvaluation(4.9).grade, 'F');
});

test('calculateExamResult handles all-skipped edge case correctly', () => {
  const sample = mockQuestions.slice(0, 10);
  const session: ActiveExamSession = {
    id: 'test_all_skipped',
    config: {
      mode: 'custom',
      title: 'Skipped Test',
      questionCount: 10,
      durationMinutes: 10,
      selectedGroups: [],
      selectedCdrs: [],
      selectedDifficulties: [],
      shuffleQuestions: false,
      shuffleOptions: false,
      immediateFeedback: false
    },
    questions: sample,
    userAnswers: {},
    flaggedQuestions: {},
    startedAt: 1000,
    totalDurationSeconds: 600,
    remainingSeconds: 600,
    lastActiveAt: 1000,
    currentQuestionIndex: 0,
    isCompleted: false
  };

  const res = calculateExamResult(session);
  assert.equal(res.score10, 0);
  assert.equal(res.skippedCount, 10);
  assert.equal(res.passed, false);
});

test('generateCustomExam with real 319 Big Data questions from questions.json works properly', () => {
  const dataPath = path.resolve(__dirname, '../data/questions.json');
  const realQuestions: Question[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const exam = generateCustomExam(realQuestions, {
    mode: 'custom',
    title: 'Big Data 40',
    questionCount: 40,
    durationMinutes: 45,
    selectedGroups: [1, 2, 3, 4, 5],
    selectedCdrs: ['CĐR 1.1', 'CĐR 2.1', 'CĐR 3.1', 'Thực hành'],
    selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
    shuffleQuestions: true,
    shuffleOptions: false,
    immediateFeedback: false
  });
  assert.equal(exam.length, 40);
  const uniqueIds = new Set(exam.map(q => q.id));
  assert.equal(uniqueIds.size, 40);
});
