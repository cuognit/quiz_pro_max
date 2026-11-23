export type Difficulty = 'DỄ' | 'TRUNG BÌNH' | 'KHÓ';

export type CdrType = 'CĐR 1.1' | 'CĐR 2.1' | 'CĐR 3.1' | 'Thực hành';

export type ExamMode = 'custom' | 'practice' | 'mistakes';

export type UserAnswerValue = number | number[];

export interface QuestionOption {
  id: number;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Question {
  id: string;
  code: string;
  group: number; // 1 to 5 (Batch 1..5)
  groupName: string;
  cdr: CdrType;
  difficulty: Difficulty;
  topic: string;
  question: string;
  options: QuestionOption[];
  correctOption: number; // 1..4 (first correct option, or 0 for discussion)
  correctOptions?: number[]; // e.g. [1, 2, 4] for multi-select, [] for discussion
  isMultiSelect?: boolean;
  isDiscussion?: boolean;
  diagramUrl?: string | null;
  explanation?: string;
}

export interface ExamConfig {
  mode: ExamMode;
  title: string;
  questionCount: number;
  durationMinutes: number; // 0 = unlimited
  selectedGroups: number[]; // e.g. [1, 2, 3, 4, 5]
  selectedCdrs: CdrType[];
  selectedDifficulties: Difficulty[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  immediateFeedback: boolean; // For practice mode
}

export interface ActiveExamSession {
  id: string;
  config: ExamConfig;
  questions: Question[];
  userAnswers: Record<string, UserAnswerValue>; // questionId -> optionId or optionIds[]
  flaggedQuestions: Record<string, boolean>; // questionId -> boolean
  startedAt: number; // timestamp
  totalDurationSeconds: number;
  remainingSeconds: number;
  lastActiveAt: number;
  currentQuestionIndex: number;
  isCompleted: boolean;
}

export interface QuestionResultDetail {
  question: Question;
  userAnswer: UserAnswerValue | null;
  userAnswersList: number[];
  correctAnswer: number;
  correctAnswersList: number[];
  scoreRatio: number; // 0 to 1 (supports partial credit)
  isCorrect: boolean;
  isPartial?: boolean;
  isSkipped: boolean;
  isDiscussion?: boolean;
}

export interface BreakdownStat {
  total: number;
  correct: number; // can be fractional with partial credit, rounded to 2 decimals
  percentage: number;
}

export interface ExamResult {
  id: string;
  title: string;
  mode: ExamMode;
  completedAt: number;
  timeSpentSeconds: number;
  totalDurationSeconds: number;
  totalQuestions: number;
  gradedQuestions: number;
  discussionCount: number;
  correctCount: number;
  partialCount: number;
  incorrectCount: number;
  skippedCount: number;
  earnedPoints: number;
  score10: number; // Scale of 10
  percentage: number;
  passed: boolean;
  breakdownByCdr: Record<string, BreakdownStat>;
  breakdownByDifficulty: Record<string, BreakdownStat>;
  breakdownByGroup: Record<number, BreakdownStat>;
  breakdownByTopic: Record<string, BreakdownStat>;
  details: QuestionResultDetail[];
}

export interface MistakeRecord {
  questionId: string;
  wrongCount: number;
  lastWrongAt: number;
  lastUserAnswer?: UserAnswerValue;
  resolved: boolean;
}
