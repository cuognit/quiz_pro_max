import {
  Question,
  ExamConfig,
  ActiveExamSession,
  ExamResult,
  BreakdownStat,
  QuestionResultDetail,
  UserAnswerValue,
  CdrType
} from '../types/quiz';

export const ALL_BATCH_GROUPS = [1, 2, 3, 4, 5] as const;

export const BATCH_INFO: Record<number, { shortName: string; name: string; desc: string }> = {
  1: {
    shortName: 'Batch 1',
    name: 'Tổng quan & 6V Big Data',
    desc: 'Nguồn dữ liệu, 6V, 5P Data Science, HDFS, MapReduce, Spark cơ bản'
  },
  2: {
    shortName: 'Batch 2',
    name: 'NoSQL, ML & Hadoop/Spark',
    desc: 'CAP, NoSQL (MongoDB, Redis, Cassandra), Machine Learning, đơn vị dữ liệu'
  },
  3: {
    shortName: 'Batch 3',
    name: 'Stream, ACID/BASE & Data Lake',
    desc: 'Batch vs Stream, ACID, BASE, CAP, Schema on Read/Write, Data Lake/Warehouse'
  },
  4: {
    shortName: 'Batch 4',
    name: 'SQL, Graph, ETL & Data Eng',
    desc: 'SQL, Graph DB (Neo4j), Spark Components, Lambda Architecture, ETL'
  },
  5: {
    shortName: 'Batch 5',
    name: 'Thực hành Tình huống & Truy vấn',
    desc: 'Tình huống thực tế & code pandas, PySpark, MySQL, MongoDB, Neo4j, Redis, Solr, Splunk, Delta'
  }
};

export const ALL_CDRS: CdrType[] = ['CĐR 1.1', 'CĐR 2.1', 'CĐR 3.1', 'Thực hành'];

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
 * Normalize correct option IDs for a question
 */
export function getCorrectOptions(q: Question): number[] {
  if (q.isDiscussion) return [];
  if (Array.isArray(q.correctOptions) && q.correctOptions.length > 0) {
    return [...new Set(q.correctOptions)].sort((a, b) => a - b);
  }
  return q.correctOption > 0 ? [q.correctOption] : [];
}

/**
 * Normalize user answer (single number or array of numbers) to sorted unique number[]
 */
export function normalizeUserAnswer(val: UserAnswerValue | null | undefined): number[] {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) {
    return [...new Set(val.filter(n => typeof n === 'number' && n > 0))].sort((a, b) => a - b);
  }
  return typeof val === 'number' && val > 0 ? [val] : [];
}

/**
 * Check if a question has been answered by the user
 */
export function isQuestionAnswered(val: UserAnswerValue | null | undefined): boolean {
  return normalizeUserAnswer(val).length > 0;
}

/**
 * Evaluate a user's answer for a question (supports single-choice, multi-select partial credit, and discussion questions)
 */
export function evaluateQuestionAnswer(
  q: Question,
  rawAnswer: UserAnswerValue | null | undefined
): {
  userAnswersList: number[];
  correctAnswersList: number[];
  scoreRatio: number;
  isCorrect: boolean;
  isPartial: boolean;
  isSkipped: boolean;
  isDiscussion: boolean;
} {
  const userAnswersList = normalizeUserAnswer(rawAnswer);
  const correctAnswersList = getCorrectOptions(q);
  const isSkipped = userAnswersList.length === 0;

  if (q.isDiscussion || correctAnswersList.length === 0) {
    return {
      userAnswersList,
      correctAnswersList: [],
      scoreRatio: 0,
      isCorrect: false,
      isPartial: false,
      isSkipped,
      isDiscussion: true
    };
  }

  if (isSkipped) {
    return {
      userAnswersList,
      correctAnswersList,
      scoreRatio: 0,
      isCorrect: false,
      isPartial: false,
      isSkipped: true,
      isDiscussion: false
    };
  }

  // Single choice
  if (correctAnswersList.length === 1 && !q.isMultiSelect) {
    const isExact = userAnswersList.length === 1 && userAnswersList[0] === correctAnswersList[0];
    return {
      userAnswersList,
      correctAnswersList,
      scoreRatio: isExact ? 1 : 0,
      isCorrect: isExact,
      isPartial: false,
      isSkipped: false,
      isDiscussion: false
    };
  }

  // Multi-select with fair partial credit:
  // scoreRatio = max(0, (correctSelected - wrongSelected) / totalCorrect)
  const correctSet = new Set(correctAnswersList);
  const correctSelected = userAnswersList.filter(a => correctSet.has(a)).length;
  const wrongSelected = userAnswersList.filter(a => !correctSet.has(a)).length;

  const isExact = correctSelected === correctAnswersList.length && wrongSelected === 0;
  const rawRatio = isExact
    ? 1
    : Math.max(0, (correctSelected - wrongSelected) / correctAnswersList.length);
  const scoreRatio = Number(rawRatio.toFixed(2));

  return {
    userAnswersList,
    correctAnswersList,
    scoreRatio,
    isCorrect: isExact,
    isPartial: !isExact && scoreRatio > 0,
    isSkipped: false,
    isDiscussion: false
  };
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
 * Calculates complete exam result, scores (with partial credit & excluding discussion questions), and categorical breakdowns
 */
export function calculateExamResult(
  session: ActiveExamSession,
  timeSpentSecondsOverride?: number
): ExamResult {
  const { questions, userAnswers, totalDurationSeconds, remainingSeconds, config } = session;

  let gradedQuestions = 0;
  let discussionCount = 0;
  let correctCount = 0;
  let partialCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let earnedPoints = 0;

  const cdrMap: Record<string, { total: number; correct: number }> = {};
  const diffMap: Record<string, { total: number; correct: number }> = {};
  const groupMap: Record<number, { total: number; correct: number }> = {};
  const topicMap: Record<string, { total: number; correct: number }> = {};

  const details: QuestionResultDetail[] = [];

  for (const q of questions) {
    const rawAns = userAnswers[q.id] ?? null;
    const evaluation = evaluateQuestionAnswer(q, rawAns);

    if (evaluation.isDiscussion) {
      discussionCount++;
    } else {
      gradedQuestions++;
      earnedPoints += evaluation.scoreRatio;

      if (evaluation.isCorrect) {
        correctCount++;
      } else if (evaluation.isPartial) {
        partialCount++;
      } else if (evaluation.isSkipped) {
        skippedCount++;
      } else {
        incorrectCount++;
      }

      // Breakdown maps (only count graded questions)
      if (!cdrMap[q.cdr]) cdrMap[q.cdr] = { total: 0, correct: 0 };
      cdrMap[q.cdr].total++;
      cdrMap[q.cdr].correct += evaluation.scoreRatio;

      if (!diffMap[q.difficulty]) diffMap[q.difficulty] = { total: 0, correct: 0 };
      diffMap[q.difficulty].total++;
      diffMap[q.difficulty].correct += evaluation.scoreRatio;

      if (!groupMap[q.group]) groupMap[q.group] = { total: 0, correct: 0 };
      groupMap[q.group].total++;
      groupMap[q.group].correct += evaluation.scoreRatio;

      const topic = q.topic || 'Tổng quát';
      if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0 };
      topicMap[topic].total++;
      topicMap[topic].correct += evaluation.scoreRatio;
    }

    details.push({
      question: q,
      userAnswer: rawAns,
      userAnswersList: evaluation.userAnswersList,
      correctAnswer: q.correctOption,
      correctAnswersList: evaluation.correctAnswersList,
      scoreRatio: evaluation.scoreRatio,
      isCorrect: evaluation.isCorrect,
      isPartial: evaluation.isPartial,
      isSkipped: evaluation.isSkipped,
      isDiscussion: evaluation.isDiscussion
    });
  }

  const totalQuestions = questions.length;
  const roundedEarned = Number(earnedPoints.toFixed(2));
  const score10 = gradedQuestions > 0 ? Number(((earnedPoints / gradedQuestions) * 10).toFixed(1)) : 0;
  const percentage = gradedQuestions > 0 ? Math.round((earnedPoints / gradedQuestions) * 100) : 0;
  const passed = score10 >= 5.0;

  const toStat = (obj: { total: number; correct: number }): BreakdownStat => ({
    total: obj.total,
    correct: Number(obj.correct.toFixed(2)),
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
    title: config.title || 'Bài luyện thi Big Data',
    mode: config.mode,
    completedAt: Date.now(),
    timeSpentSeconds: timeSpent,
    totalDurationSeconds,
    totalQuestions,
    gradedQuestions,
    discussionCount,
    correctCount,
    partialCount,
    incorrectCount,
    skippedCount,
    earnedPoints: roundedEarned,
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
      feedback: 'Kiến thức Big Data của bạn rất vững vàng! Đạt mức xuất sắc cả lý thuyết lẫn thực hành.'
    };
  }
  if (score >= 8.0) {
    return {
      grade: 'A',
      label: 'Giỏi',
      colorClass: 'text-teal-600',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
      feedback: 'Kết quả rất tốt! Nắm chắc Hadoop/Spark, NoSQL, CAP/ACID và các truy vấn thực tế.'
    };
  }
  if (score >= 7.0) {
    return {
      grade: 'B+',
      label: 'Khá',
      colorClass: 'text-blue-600',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      feedback: 'Đạt kết quả khá tốt. Hãy xem lại các câu chọn nhiều đáp án và tình huống truy vấn ở Batch 5.'
    };
  }
  if (score >= 5.0) {
    return {
      grade: 'C',
      label: 'Đạt yêu cầu',
      colorClass: 'text-amber-600',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      feedback: 'Bạn đã vượt qua điểm chuẩn! Nên luyện tập thêm trong "Ôn câu làm sai" để củng cố.'
    };
  }
  return {
    grade: 'F',
    label: 'Chưa đạt',
    colorClass: 'text-rose-600',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    feedback: 'Chưa đạt chuẩn. Hãy làm lại bài kiểm tra và ôn tập kỹ các câu hỏi trong ngân hàng Big Data.'
  };
}

/**
 * Generate 3 realistic progressive sample exam results for demo & testing the visual heat map
 */
export function generateSampleHistoryData(allQuestions: Question[]): ExamResult[] {
  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;

  const baseConfig = (title: string, shuffle: boolean): ExamConfig => ({
    mode: 'custom',
    title,
    questionCount: 40,
    durationMinutes: 45,
    selectedGroups: [1, 2, 3, 4, 5],
    selectedCdrs: ['CĐR 1.1', 'CĐR 2.1', 'CĐR 3.1', 'Thực hành'],
    selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
    shuffleQuestions: shuffle,
    shuffleOptions: false,
    immediateFeedback: false
  });

  const buildAnswers = (qSet: Question[], rateFn: (q: Question, idx: number) => boolean) => {
    const answers: Record<string, UserAnswerValue> = {};
    qSet.forEach((q, idx) => {
      if (q.isDiscussion) return;
      const correctList = getCorrectOptions(q);
      const isRight = rateFn(q, idx);
      if (q.isMultiSelect) {
        answers[q.id] = isRight ? correctList : [correctList[0]];
      } else {
        answers[q.id] = isRight ? correctList[0] : (correctList[0] % 4) + 1;
      }
    });
    return answers;
  };

  const qSet1 = generateCustomExam(allQuestions, baseConfig('Đề Tự Chọn Big Data #1', false));
  const session1: ActiveExamSession = {
    id: 'sample_session_1',
    config: baseConfig('Đề Tự Chọn Big Data #1', false),
    questions: qSet1,
    userAnswers: buildAnswers(qSet1, (q, idx) => idx % 3 !== 0 && (q.group <= 2 || idx % 2 === 0)),
    flaggedQuestions: {},
    startedAt: now - 2 * dayMs - 2400 * 1000,
    totalDurationSeconds: 2700,
    remainingSeconds: 300,
    lastActiveAt: now - 2 * dayMs,
    currentQuestionIndex: qSet1.length - 1,
    isCompleted: true
  };
  const res1 = calculateExamResult(session1, 2400);
  res1.id = 'sample_res_1';
  res1.completedAt = now - 2 * dayMs;

  const qSet2 = generateCustomExam(allQuestions, baseConfig('Đề Tự Chọn Big Data #2', true));
  const session2: ActiveExamSession = {
    id: 'sample_session_2',
    config: baseConfig('Đề Tự Chọn Big Data #2', true),
    questions: qSet2,
    userAnswers: buildAnswers(qSet2, (_q, idx) => idx % 4 !== 0),
    flaggedQuestions: {},
    startedAt: now - 1 * dayMs - 2100 * 1000,
    totalDurationSeconds: 2700,
    remainingSeconds: 600,
    lastActiveAt: now - 1 * dayMs,
    currentQuestionIndex: qSet2.length - 1,
    isCompleted: true
  };
  const res2 = calculateExamResult(session2, 2100);
  res2.id = 'sample_res_2';
  res2.completedAt = now - 1 * dayMs;

  const qSet3 = generateCustomExam(allQuestions, baseConfig('Đề Tự Chọn Big Data #3', true));
  const session3: ActiveExamSession = {
    id: 'sample_session_3',
    config: baseConfig('Đề Tự Chọn Big Data #3', true),
    questions: qSet3,
    userAnswers: buildAnswers(qSet3, (_q, idx) => idx % 8 !== 0),
    flaggedQuestions: {},
    startedAt: now - 3 * 3600 * 1000,
    totalDurationSeconds: 2700,
    remainingSeconds: 900,
    lastActiveAt: now - 2 * 3600 * 1000,
    currentQuestionIndex: qSet3.length - 1,
    isCompleted: true
  };
  const res3 = calculateExamResult(session3, 1800);
  res3.id = 'sample_res_3';
  res3.completedAt = now - 2 * 3600 * 1000;

  return [res3, res2, res1];
}
