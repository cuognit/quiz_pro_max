import {
  Question,
  ExamConfig,
  ActiveExamSession,
  ExamResult,
  BreakdownStat,
  QuestionResultDetail
} from '../types/quiz';

/**
 * Standard Exam Blueprint according to syllabus:
 * Total: 50 questions
 * - Group 1: 10 questions (DỄ, CĐR 1.1)
 * - Group 2: 15 questions (TRUNG BÌNH, CĐR 1.1)
 * - Group 3: 3 questions (KHÓ, CĐR 1.1)
 * - Group 4: 5 questions (DỄ, CĐR 2.1)
 * - Group 5: 12 questions (TRUNG BÌNH, CĐR 2.1)
 * - Group 6: 5 questions (KHÓ, CĐR 2.1)
 */
export const STANDARD_EXAM_BLUEPRINT = [
  { group: 1, count: 10, name: 'Group 1 (DỄ, CĐR 1.1)' },
  { group: 2, count: 15, name: 'Group 2 (TRUNG BÌNH, CĐR 1.1)' },
  { group: 3, count: 3, name: 'Group 3 (KHÓ, CĐR 1.1)' },
  { group: 4, count: 5, name: 'Group 4 (DỄ, CĐR 2.1)' },
  { group: 5, count: 12, name: 'Group 5 (TRUNG BÌNH, CĐR 2.1)' },
  { group: 6, count: 5, name: 'Group 6 (KHÓ, CĐR 2.1)' }
];

/**
 * Shuffle array randomly using Fisher-Yates
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates an official 50-question standard exam adhering to the blueprint
 */
export function generateStandardExam(allQuestions: Question[], shuffle = true): Question[] {
  const selected: Question[] = [];

  for (const item of STANDARD_EXAM_BLUEPRINT) {
    const groupQuestions = allQuestions.filter(q => q.group === item.group);
    const randomized = shuffle ? shuffleArray(groupQuestions) : groupQuestions;
    const picked = randomized.slice(0, item.count);
    selected.push(...picked);
  }

  return shuffle ? shuffleArray(selected) : selected;
}

/**
 * Generates a custom exam based on user configuration
 */
export function generateCustomExam(allQuestions: Question[], config: ExamConfig): Question[] {
  let pool = allQuestions.filter(q => {
    if (config.selectedGroups.length > 0 && !config.selectedGroups.includes(q.group)) {
      return false;
    }
    if (config.selectedCdrs.length > 0 && !config.selectedCdrs.includes(q.cdr)) {
      return false;
    }
    if (config.selectedDifficulties.length > 0 && !config.selectedDifficulties.includes(q.difficulty)) {
      return false;
    }
    return true;
  });

  if (pool.length === 0) {
    pool = [...allQuestions];
  }

  if (config.shuffleQuestions) {
    pool = shuffleArray(pool);
  }

  const count = Math.min(config.questionCount, pool.length);
  return pool.slice(0, count);
}

/**
 * Calculates complete exam result, scores, and categorical breakdowns
 */
export function calculateExamResult(
  session: ActiveExamSession,
  timeSpentSecondsOverride?: number
): ExamResult {
  const { questions, userAnswers, totalDurationSeconds, remainingSeconds, config } = session;

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const cdrMap: Record<string, { total: number; correct: number }> = {};
  const diffMap: Record<string, { total: number; correct: number }> = {};
  const groupMap: Record<number, { total: number; correct: number }> = {};
  const topicMap: Record<string, { total: number; correct: number }> = {};

  const details: QuestionResultDetail[] = [];

  for (const q of questions) {
    const userAns = userAnswers[q.id] ?? null;
    const isCorrect = userAns === q.correctOption;
    const isSkipped = userAns === null;

    if (isCorrect) {
      correctCount++;
    } else if (isSkipped) {
      skippedCount++;
    } else {
      incorrectCount++;
    }

    // Breakdown maps
    if (!cdrMap[q.cdr]) cdrMap[q.cdr] = { total: 0, correct: 0 };
    cdrMap[q.cdr].total++;
    if (isCorrect) cdrMap[q.cdr].correct++;

    if (!diffMap[q.difficulty]) diffMap[q.difficulty] = { total: 0, correct: 0 };
    diffMap[q.difficulty].total++;
    if (isCorrect) diffMap[q.difficulty].correct++;

    if (!groupMap[q.group]) groupMap[q.group] = { total: 0, correct: 0 };
    groupMap[q.group].total++;
    if (isCorrect) groupMap[q.group].correct++;

    const topic = q.topic || 'Tổng quát';
    if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0 };
    topicMap[topic].total++;
    if (isCorrect) topicMap[topic].correct++;

    details.push({
      question: q,
      userAnswer: userAns,
      correctAnswer: q.correctOption,
      isCorrect,
      isSkipped
    });
  }

  const totalQuestions = questions.length;
  const score10 = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 10).toFixed(1)) : 0;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score10 >= 5.0;

  const toStat = (obj: { total: number; correct: number }): BreakdownStat => ({
    total: obj.total,
    correct: obj.correct,
    percentage: obj.total > 0 ? Math.round((obj.correct / obj.total) * 100) : 0
  });

  const breakdownByCdr: Record<string, BreakdownStat> = {};
  for (const [k, v] of Object.entries(cdrMap)) breakdownByCdr[k] = toStat(v);

  const breakdownByDifficulty: Record<string, BreakdownStat> = {};
  for (const [k, v] of Object.entries(diffMap)) breakdownByDifficulty[k] = toStat(v);

  const breakdownByGroup: Record<number, BreakdownStat> = {};
  for (const [k, v] of Object.entries(groupMap)) breakdownByGroup[Number(k)] = toStat(v);

  const breakdownByTopic: Record<string, BreakdownStat> = {};
  for (const [k, v] of Object.entries(topicMap)) breakdownByTopic[k] = toStat(v);

  const timeSpent =
    timeSpentSecondsOverride !== undefined
      ? timeSpentSecondsOverride
      : totalDurationSeconds > 0
      ? Math.max(0, totalDurationSeconds - remainingSeconds)
      : Math.floor((Date.now() - session.startedAt) / 1000);

  return {
    id: `result_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: config.title || 'Bài thi trắc nghiệm SQA',
    mode: config.mode,
    completedAt: Date.now(),
    timeSpentSeconds: timeSpent,
    totalDurationSeconds,
    totalQuestions,
    correctCount,
    incorrectCount,
    skippedCount,
    score10,
    percentage,
    passed,
    breakdownByCdr,
    breakdownByDifficulty,
    breakdownByGroup,
    breakdownByTopic,
    details
  };
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Evaluation feedback based on score
 */
export function getGradeEvaluation(score: number): {
  grade: string;
  label: string;
  colorClass: string;
  badgeClass: string;
  feedback: string;
} {
  if (score >= 9.0) {
    return {
      grade: 'A+',
      label: 'Xuất sắc',
      colorClass: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      feedback: 'Kiến thức SQA của bạn rất vững vàng! Đạt chuẩn đầu ra xuất sắc.'
    };
  }
  if (score >= 8.0) {
    return {
      grade: 'A',
      label: 'Giỏi',
      colorClass: 'text-teal-600',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
      feedback: 'Kết quả rất tốt! Nắm vững cả lý thuyết hộp trắng, hộp đen và luồng dữ liệu.'
    };
  }
  if (score >= 7.0) {
    return {
      grade: 'B+',
      label: 'Khá',
      colorClass: 'text-blue-600',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      feedback: 'Đạt kết quả khá tốt. Hãy xem lại các câu hỏi khó về độ phức tạp chu trình và luồng dữ liệu.'
    };
  }
  if (score >= 5.0) {
    return {
      grade: 'C',
      label: 'Đạt yêu cầu',
      colorClass: 'text-amber-600',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      feedback: 'Bạn đã vượt qua điểm chuẩn! Nên luyện tập thêm trong "Bộ câu hỏi làm sai" để củng cố.'
    };
  }
  return {
    grade: 'F',
    label: 'Chưa đạt',
    colorClass: 'text-rose-600',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    feedback: 'Chưa đạt chuẩn. Hãy làm lại bài kiểm tra và ôn tập kỹ các câu hỏi trong ngân hàng.'
  };
}

/**
 * Generate 3 realistic progressive sample exam results for demo & testing the visual heat map
 */
export function generateSampleHistoryData(allQuestions: Question[]): ExamResult[] {
  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;

  // Exam 1: 2 days ago (Score ~5.6 - fair performance)
  const qSet1 = generateStandardExam(allQuestions, false);
  const answers1: Record<string, number> = {};
  qSet1.forEach((q, idx) => {
    // Correct rate ~56%
    const isRight = idx % 9 !== 0 && idx % 7 !== 0 && (q.group <= 2 ? idx % 3 !== 0 : idx % 2 === 0);
    answers1[q.id] = isRight ? q.correctOption : (q.correctOption % 4) + 1;
  });
  const session1: ActiveExamSession = {
    id: 'sample_session_1',
    config: {
      mode: 'standard',
      title: 'Đề Thi Chuẩn SQA #1',
      questionCount: 50,
      durationMinutes: 60,
      selectedGroups: [1, 2, 3, 4, 5, 6],
      selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
      selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
      shuffleQuestions: false,
      shuffleOptions: false,
      immediateFeedback: false
    },
    questions: qSet1,
    userAnswers: answers1,
    flaggedQuestions: {},
    startedAt: now - 2 * dayMs - 3400 * 1000,
    totalDurationSeconds: 3600,
    remainingSeconds: 400,
    lastActiveAt: now - 2 * dayMs,
    currentQuestionIndex: 49,
    isCompleted: true
  };
  const res1 = calculateExamResult(session1, 3200);
  res1.id = 'sample_res_1';
  res1.completedAt = now - 2 * dayMs;

  // Exam 2: Yesterday (Score ~7.4 - good improvement)
  const qSet2 = generateStandardExam(allQuestions, true);
  const answers2: Record<string, number> = {};
  qSet2.forEach((q, idx) => {
    // Correct rate ~74%
    const isRight = q.difficulty === 'DỄ' ? true : q.difficulty === 'TRUNG BÌNH' ? idx % 4 !== 0 : idx % 2 === 0;
    answers2[q.id] = isRight ? q.correctOption : (q.correctOption % 4) + 1;
  });
  const session2: ActiveExamSession = {
    id: 'sample_session_2',
    config: {
      mode: 'standard',
      title: 'Đề Thi Chuẩn SQA (Lần 2)',
      questionCount: 50,
      durationMinutes: 60,
      selectedGroups: [1, 2, 3, 4, 5, 6],
      selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
      selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
      shuffleQuestions: true,
      shuffleOptions: false,
      immediateFeedback: false
    },
    questions: qSet2,
    userAnswers: answers2,
    flaggedQuestions: {},
    startedAt: now - 1 * dayMs - 2800 * 1000,
    totalDurationSeconds: 3600,
    remainingSeconds: 800,
    lastActiveAt: now - 1 * dayMs,
    currentQuestionIndex: 49,
    isCompleted: true
  };
  const res2 = calculateExamResult(session2, 2800);
  res2.id = 'sample_res_2';
  res2.completedAt = now - 1 * dayMs;

  // Exam 3: Earlier today (Score ~8.8 - advanced mastery)
  const qSet3 = generateStandardExam(allQuestions, true);
  const answers3: Record<string, number> = {};
  qSet3.forEach((q, idx) => {
    // Correct rate ~88%
    const isRight = idx % 8 !== 0;
    answers3[q.id] = isRight ? q.correctOption : (q.correctOption % 4) + 1;
  });
  const session3: ActiveExamSession = {
    id: 'sample_session_3',
    config: {
      mode: 'standard',
      title: 'Đề Thi Chuẩn SQA (Lần 3)',
      questionCount: 50,
      durationMinutes: 60,
      selectedGroups: [1, 2, 3, 4, 5, 6],
      selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
      selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
      shuffleQuestions: true,
      shuffleOptions: false,
      immediateFeedback: false
    },
    questions: qSet3,
    userAnswers: answers3,
    flaggedQuestions: {},
    startedAt: now - 3 * 3600 * 1000,
    totalDurationSeconds: 3600,
    remainingSeconds: 1200,
    lastActiveAt: now - 2 * 3600 * 1000,
    currentQuestionIndex: 49,
    isCompleted: true
  };
  const res3 = calculateExamResult(session3, 2400);
  res3.id = 'sample_res_3';
  res3.completedAt = now - 2 * 3600 * 1000;

  // Return sorted descending (newest first for standard storage history)
  return [res3, res2, res1];
}
