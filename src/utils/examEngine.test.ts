import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateStandardExam,
  generateCustomExam,
  calculateExamResult,
  formatTime,
  getGradeEvaluation,
  STANDARD_EXAM_BLUEPRINT
} from './examEngine';
import { Question, ActiveExamSession } from '../types/quiz';

// Mock questions for testing
const mockQuestions: Question[] = [];
for (let g = 1; g <= 6; g++) {
  for (let i = 1; i <= 20; i++) {
    mockQuestions.push({
      id: `q_${g}_${i}`,
      code: `${g * 100 + i}`,
      group: g,
      groupName: `Group ${g}`,
      cdr: g <= 3 ? 'CĐR 1.1' : 'CĐR 2.1',
      difficulty: g === 1 || g === 4 ? 'DỄ' : g === 2 || g === 5 ? 'TRUNG BÌNH' : 'KHÓ',
      topic: 'Kiểm thử hộp đen',
      question: `Câu hỏi mẫu số ${g}-${i}`,
      options: [
        { id: 1, label: 'A', text: 'Đáp án A' },
        { id: 2, label: 'B', text: 'Đáp án B' },
        { id: 3, label: 'C', text: 'Đáp án C' },
        { id: 4, label: 'D', text: 'Đáp án D' }
      ],
      correctOption: 2
    });
  }
}

test('generateStandardExam generates exactly 50 questions adhering to syllabus', () => {
  const exam = generateStandardExam(mockQuestions, false);
  assert.equal(exam.length, 50);

  // Check counts per group
  for (const bp of STANDARD_EXAM_BLUEPRINT) {
    const inGroup = exam.filter(q => q.group === bp.group);
    assert.equal(inGroup.length, bp.count, `Group ${bp.group} should have ${bp.count} questions`);
  }
});

test('generateCustomExam respects questionCount and filters', () => {
  const custom = generateCustomExam(mockQuestions, {
    mode: 'custom',
    title: 'Custom Test',
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

test('calculateExamResult accurately calculates scores, 10-point scale, and categorical stats', () => {
  const sampleQuestions = mockQuestions.slice(0, 10);
  const session: ActiveExamSession = {
    id: 'test_session_1',
    config: {
      mode: 'standard',
      title: 'Bài thi thử nghiệm',
      questionCount: 10,
      durationMinutes: 15,
      selectedGroups: [],
      selectedCdrs: [],
      selectedDifficulties: [],
      shuffleQuestions: false,
      shuffleOptions: false,
      immediateFeedback: false
    },
    questions: sampleQuestions,
    // Answering 7 correct (opt 2), 2 wrong (opt 1), 1 skipped
    userAnswers: {
      [sampleQuestions[0].id]: 2,
      [sampleQuestions[1].id]: 2,
      [sampleQuestions[2].id]: 2,
      [sampleQuestions[3].id]: 2,
      [sampleQuestions[4].id]: 2,
      [sampleQuestions[5].id]: 2,
      [sampleQuestions[6].id]: 2,
      [sampleQuestions[7].id]: 1,
      [sampleQuestions[8].id]: 1
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

  assert.equal(result.totalQuestions, 10);
  assert.equal(result.correctCount, 7);
  assert.equal(result.incorrectCount, 2);
  assert.equal(result.skippedCount, 1);
  assert.equal(result.score10, 7.0);
  assert.equal(result.percentage, 70);
  assert.equal(result.passed, true);
  assert.equal(result.timeSpentSeconds, 600); // 900 - 300
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

test('calculateExamResult preserves details for re-attempt and continuation', () => {
  const sample = mockQuestions.slice(0, 5);
  const session: ActiveExamSession = {
    id: 'test_session_resume',
    config: {
      mode: 'standard',
      title: 'Test',
      questionCount: 5,
      durationMinutes: 10,
      selectedGroups: [],
      selectedCdrs: [],
      selectedDifficulties: [],
      shuffleQuestions: false,
      shuffleOptions: false,
      immediateFeedback: false
    },
    questions: sample,
    userAnswers: {
      [sample[0].id]: 2, // correct
      [sample[1].id]: 1  // wrong
      // 2, 3, 4 skipped
    },
    flaggedQuestions: {},
    startedAt: 1000,
    totalDurationSeconds: 600,
    remainingSeconds: 400,
    lastActiveAt: 1200,
    currentQuestionIndex: 1,
    isCompleted: false
  };

  const res = calculateExamResult(session);
  assert.equal(res.skippedCount, 3);
  assert.equal(res.correctCount, 1);
  assert.equal(res.incorrectCount, 1);

  // Unanswered questions can be identified for continuation
  const unansweredDetails = res.details.filter(d => d.userAnswer === null);
  assert.equal(unansweredDetails.length, 3);
  assert.equal(unansweredDetails[0].question.id, sample[2].id);
});
