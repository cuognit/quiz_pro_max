export type Difficulty = 'DỄ' | 'TRUNG BÌNH' | 'KHÓ';

export type CdrType = 'CĐR 1.1' | 'CĐR 2.1';

export type ExamMode = 'standard' | 'custom' | 'practice' | 'mistakes';

export interface QuestionOption {
  id: number;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Question {
  id: string;
  code: string;
  group: number; // 1 to 6
  groupName: string;
  cdr: CdrType;
  difficulty: Difficulty;
  topic: string;
  question: string;
  options: QuestionOption[];
  correctOption: number; // 1, 2, 3, 4
  diagramUrl?: string | null;
  explanation?: string;
}

export interface ExamConfig {
  mode: ExamMode;
  title: string;
  questionCount: number;
  durationMinutes: number; // 0 = unlimited
  selectedGroups: number[]; // e.g. [1, 2, 3, 4, 5, 6]
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
  userAnswers: Record<string, number>; // questionId -> selectedOptionId (1..4)
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
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  isSkipped: boolean;
}

export interface BreakdownStat {
  total: number;
  correct: number;
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
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
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
  lastUserAnswer?: number;
  resolved: boolean;
}
