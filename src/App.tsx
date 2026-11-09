import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Navbar, TabType } from './components/Navbar';
import { ResumeBanner } from './components/ResumeBanner';
import { ExamSetupView } from './components/ExamSetupView';
import { ActiveExamView } from './components/ActiveExamView';
import { ExamResultView } from './components/ExamResultView';
import { MistakesView } from './components/MistakesView';
import { HistoryView } from './components/HistoryView';
import { QuestionBankBrowser } from './components/QuestionBankBrowser';
import questionsData from './data/questions.json';
import { Question, ExamConfig, ActiveExamSession, ExamResult } from './types/quiz';
import {
  generateStandardExam,
  generateCustomExam,
  calculateExamResult
} from './utils/examEngine';
import {
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  getExamHistory,
  saveExamResult,
  getMistakeRecords,
  getBookmarks
} from './utils/storage';
import {
  ThemeMode,
  getThemePreference,
  setThemePreference,
  applyTheme,
  setupThemeListener
} from './utils/theme';

const allQuestions = questionsData as Question[];

const TAB_ORDER: Record<TabType, number> = {
  exam: 0,
  mistakes: 1,
  history: 2,
  bank: 3
};

const tabVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 32 : dir < 0 ? -32 : 0,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 420, damping: 32 },
      opacity: { duration: 0.22, ease: 'easeOut' }
    }
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -32 : dir < 0 ? 32 : 0,
    opacity: 0,
    transition: {
      x: { duration: 0.18, ease: 'easeIn' },
      opacity: { duration: 0.16, ease: 'easeIn' }
    }
  })
};

const pageSlideUpVariants: Variants = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 30,
      opacity: { duration: 0.22, ease: 'easeOut' }
    }
  },
  exit: {
    y: -15,
    opacity: 0,
    transition: {
      duration: 0.16,
      ease: 'easeIn'
    }
  }
};

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getThemePreference);
  const [activeTab, setActiveTab] = useState<TabType>('exam');
  const [direction, setDirection] = useState<number>(0);
  const [activeSession, setActiveSession] = useState<ActiveExamSession | null>(null);
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [mistakes, setMistakes] = useState(getMistakeRecords());
  const [bookmarks, setBookmarks] = useState<string[]>(getBookmarks());
  const [filterBookmarksOnly, setFilterBookmarksOnly] = useState<boolean>(false);

  // Initialize theme
  useEffect(() => {
    applyTheme(theme);
    const cleanup = setupThemeListener(() => {
      // System theme change handled
    });
    return cleanup;
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setThemePreference(newTheme);
  };

  // Load storage state on mount
  useEffect(() => {
    const savedSession = getActiveSession();
    if (savedSession) {
      setActiveSession(savedSession);
      // Keep isExamActive false on initial reload so user sees the Home/Resume banner first
    }
    setHistory(getExamHistory());
    setMistakes(getMistakeRecords());
    setBookmarks(getBookmarks());

    // Check query params e.g. ?autostart=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !savedSession) {
      startStandardExamAuto();
    }
  }, []);

  const refreshStorageData = () => {
    setHistory(getExamHistory());
    setMistakes(getMistakeRecords());
    setBookmarks(getBookmarks());
  };

  const startStandardExamAuto = () => {
    const questions = generateStandardExam(allQuestions, true);
    const session: ActiveExamSession = {
      id: `session_${Date.now()}`,
      config: {
        mode: 'standard',
        title: 'Đề Thi Chuẩn SQA (50 Câu - 60 Phút)',
        questionCount: 50,
        durationMinutes: 60,
        selectedGroups: [1, 2, 3, 4, 5, 6],
        selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
        selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
        shuffleQuestions: true,
        shuffleOptions: false,
        immediateFeedback: false
      },
      questions,
      userAnswers: {},
      flaggedQuestions: {},
      startedAt: Date.now(),
      totalDurationSeconds: 60 * 60,
      remainingSeconds: 60 * 60,
      lastActiveAt: Date.now(),
      currentQuestionIndex: 0,
      isCompleted: false
    };

    saveActiveSession(session);
    setActiveSession(session);
    setIsExamActive(true);
    setCurrentResult(null);
  };

  // Start new exam from config
  const handleStartExam = (config: ExamConfig) => {
    let examQuestions: Question[];

    if (config.mode === 'standard') {
      examQuestions = generateStandardExam(allQuestions, config.shuffleQuestions);
    } else {
      examQuestions = generateCustomExam(allQuestions, config);
    }

    if (examQuestions.length === 0) {
      examQuestions = allQuestions.slice(0, 10);
    }

    const durationSec = config.durationMinutes > 0 ? config.durationMinutes * 60 : 0;

    const newSession: ActiveExamSession = {
      id: `session_${Date.now()}`,
      config,
      questions: examQuestions,
      userAnswers: {},
      flaggedQuestions: {},
      startedAt: Date.now(),
      totalDurationSeconds: durationSec,
      remainingSeconds: durationSec,
      lastActiveAt: Date.now(),
      currentQuestionIndex: 0,
      isCompleted: false
    };

    saveActiveSession(newSession);
    setActiveSession(newSession);
    setIsExamActive(true);
    setCurrentResult(null);
    setActiveTab('exam');
  };

  // Start targeted practice with specific questions
  const handleStartPracticeWithQuestions = (
    questionsToPractice: Question[],
    title = 'Ôn Luyện Tập Trung'
  ) => {
    const config: ExamConfig = {
      mode: 'practice',
      title: `${title} (${questionsToPractice.length} câu)`,
      questionCount: questionsToPractice.length,
      durationMinutes: 0, // untimed for deep practice
      selectedGroups: [1, 2, 3, 4, 5, 6],
      selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
      selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
      shuffleQuestions: false,
      shuffleOptions: false,
      immediateFeedback: true
    };

    const newSession: ActiveExamSession = {
      id: `practice_${Date.now()}`,
      config,
      questions: questionsToPractice,
      userAnswers: {},
      flaggedQuestions: {},
      startedAt: Date.now(),
      totalDurationSeconds: 0,
      remainingSeconds: 0,
      lastActiveAt: Date.now(),
      currentQuestionIndex: 0,
      isCompleted: false
    };

    saveActiveSession(newSession);
    setActiveSession(newSession);
    setIsExamActive(true);
    setCurrentResult(null);
    setActiveTab('exam');
  };

  // Start a fresh standard exam directly
  const handleStartNewExam = () => {
    const questions = generateStandardExam(allQuestions, true);
    const config: ExamConfig = {
      mode: 'standard',
      title: 'Đề Thi Chuẩn SQA (50 Câu - 60 Phút)',
      questionCount: 50,
      durationMinutes: 60,
      selectedGroups: [1, 2, 3, 4, 5, 6],
      selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
      selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
      shuffleQuestions: true,
      shuffleOptions: false,
      immediateFeedback: false
    };

    const newSession: ActiveExamSession = {
      id: `session_${Date.now()}`,
      config,
      questions,
      userAnswers: {},
      flaggedQuestions: {},
      startedAt: Date.now(),
      totalDurationSeconds: 60 * 60,
      remainingSeconds: 60 * 60,
      lastActiveAt: Date.now(),
      currentQuestionIndex: 0,
      isCompleted: false
    };

    saveActiveSession(newSession);
    setActiveSession(newSession);
    setIsExamActive(true);
    setCurrentResult(null);
    setActiveTab('exam');
  };

  // Retake exact same questions from previous result
  const handleRetakeSameQuestions = (result: ExamResult) => {
    const questions = result.details.map(d => d.question);
    const durationSec = result.totalDurationSeconds > 0 ? result.totalDurationSeconds : 3600;

    const newSession: ActiveExamSession = {
      id: `session_retake_${Date.now()}`,
      config: {
        mode: result.mode,
        title: `${result.title} (Làm Lại)`,
        questionCount: questions.length,
        durationMinutes: Math.round(durationSec / 60) || 60,
        selectedGroups: [1, 2, 3, 4, 5, 6],
        selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
        selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
        shuffleQuestions: false,
        shuffleOptions: false,
        immediateFeedback: result.mode === 'practice'
      },
      questions,
      userAnswers: {},
      flaggedQuestions: {},
      startedAt: Date.now(),
      totalDurationSeconds: durationSec,
      remainingSeconds: durationSec,
      lastActiveAt: Date.now(),
      currentQuestionIndex: 0,
      isCompleted: false
    };

    saveActiveSession(newSession);
    setActiveSession(newSession);
    setIsExamActive(true);
    setCurrentResult(null);
    setActiveTab('exam');
  };

  // Continue an incomplete exam session from results
  const handleContinueIncompleteExam = (result: ExamResult) => {
    const userAnswers: Record<string, number> = {};
    result.details.forEach(d => {
      if (d.userAnswer !== null) {
        userAnswers[d.question.id] = d.userAnswer;
      }
    });

    const firstUnansweredIndex = result.details.findIndex(d => d.userAnswer === null);
    const startIndex = firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0;
    const remainingTime = Math.max(result.totalDurationSeconds - result.timeSpentSeconds, 300);

    const resumedSession: ActiveExamSession = {
      id: `session_resume_${Date.now()}`,
      config: {
        mode: result.mode,
        title: `${result.title} (Tiếp Tục)`,
        questionCount: result.totalQuestions,
        durationMinutes: Math.round(remainingTime / 60) || 30,
        selectedGroups: [1, 2, 3, 4, 5, 6],
        selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
        selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
        shuffleQuestions: false,
        shuffleOptions: false,
        immediateFeedback: result.mode === 'practice'
      },
      questions: result.details.map(d => d.question),
      userAnswers,
      flaggedQuestions: {},
      startedAt: Date.now() - result.timeSpentSeconds * 1000,
      totalDurationSeconds: result.totalDurationSeconds || 3600,
      remainingSeconds: remainingTime,
      lastActiveAt: Date.now(),
      currentQuestionIndex: startIndex,
      isCompleted: false
    };

    saveActiveSession(resumedSession);
    setActiveSession(resumedSession);
    setIsExamActive(true);
    setCurrentResult(null);
    setActiveTab('exam');
  };

  // Update session during active test
  const handleUpdateSession = (updated: ActiveExamSession) => {
    setActiveSession(updated);
  };

  // Submit and grade exam
  const handleSubmitExam = () => {
    if (!activeSession) return;

    const result = calculateExamResult(activeSession);
    saveExamResult(result);
    clearActiveSession();

    setActiveSession(null);
    setIsExamActive(false);
    setCurrentResult(result);
    refreshStorageData();
  };

  // Exit exam view back to Home (pauses exam with ResumeBanner)
  const handleExitExam = () => {
    setIsExamActive(false);
    setActiveTab('exam');
  };

  // Discard in-progress session
  const handleDiscardSession = () => {
    if (window.confirm('Bạn có chắc muốn hủy bỏ bài thi đang làm dở này?')) {
      clearActiveSession();
      setActiveSession(null);
      setIsExamActive(false);
    }
  };

  // View past result
  const handleViewPastResult = (result: ExamResult) => {
    setCurrentResult(result);
  };

  // Exit result view
  const handleGoHome = () => {
    setCurrentResult(null);
    setDirection(-1);
    setActiveTab('exam');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToHistory = () => {
    setCurrentResult(null);
    setDirection(-1);
    setActiveTab('history');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectTab = (newTab: TabType) => {
    const currentIdx = TAB_ORDER[activeTab] ?? 0;
    const newIdx = TAB_ORDER[newTab] ?? 0;
    setDirection(newIdx >= currentIdx ? 1 : -1);
    setCurrentResult(null);
    setFilterBookmarksOnly(false);
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const mistakesCount = Object.values(mistakes).filter(m => !m.resolved).length;
  const bookmarksCount = bookmarks.length;
  const historyCount = history.length;
  const isCurrentlyInExam = activeSession && isExamActive;

  return (
    <div className="min-h-screen bg-[#f4f8fd] dark:bg-[#152230] flex flex-col font-sans text-[#152230] dark:text-[#f4f8fd] transition-colors selection:bg-[#4f80b9] selection:text-white">
      {/* Top Navbar (hidden during active exam to give max focus) */}
      {!isCurrentlyInExam && (
        <Navbar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          mistakesCount={mistakesCount}
          bookmarksCount={bookmarksCount}
          historyCount={historyCount}
          theme={theme}
          onThemeChange={handleThemeChange}
          onOpenBookmarks={() => {
            setDirection(1);
            setCurrentResult(null);
            setFilterBookmarksOnly(true);
            setActiveTab('bank');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        />
      )}

      {/* In-Progress Exam Banner (shown whenever there is an unfinished exam and user is NOT actively in the exam arena) */}
      {activeSession && !activeSession.isCompleted && !isCurrentlyInExam && (
        <ResumeBanner
          session={activeSession}
          onResume={() => {
            setCurrentResult(null);
            setIsExamActive(true);
            setActiveTab('exam');
          }}
          onDiscard={handleDiscardSession}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 overflow-x-clip relative">
        <AnimatePresence mode="wait">
          {isCurrentlyInExam ? (
            /* Active Exam Arena */
            <motion.div
              key="active-exam-view"
              variants={pageSlideUpVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <ActiveExamView
                session={activeSession!}
                onUpdateSession={handleUpdateSession}
                onSubmitExam={handleSubmitExam}
                onExitExam={handleExitExam}
              />
            </motion.div>
          ) : currentResult ? (
            /* Exam Result View */
            <motion.div
              key={`exam-result-${currentResult.id}`}
              variants={pageSlideUpVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <ExamResultView
                result={currentResult}
                onRetakeSameExam={() => handleRetakeSameQuestions(currentResult)}
                onStartNewExam={handleStartNewExam}
                onContinueIncompleteExam={
                  currentResult.skippedCount > 0
                    ? () => handleContinueIncompleteExam(currentResult)
                    : undefined
                }
                onPracticeMistakes={wrongQuestions =>
                  handleStartPracticeWithQuestions(wrongQuestions, 'Luyện tập các câu sai')
                }
                onGoHome={handleGoHome}
                onBackToHistory={handleBackToHistory}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {activeTab === 'exam' && (
                <ExamSetupView
                  questions={allQuestions}
                  onStartExam={handleStartExam}
                />
              )}
              {activeTab === 'mistakes' && (
                <MistakesView
                  questions={allQuestions}
                  mistakes={mistakes}
                  onRefreshMistakes={refreshStorageData}
                  onPracticeMistakes={qs =>
                    handleStartPracticeWithQuestions(qs, 'Khắc phục câu hỏi làm sai')
                  }
                  onGoToBank={() => {
                    setDirection(1);
                    setActiveTab('bank');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                />
              )}
              {activeTab === 'history' && (
                <HistoryView
                  history={history}
                  questions={allQuestions}
                  onRefreshHistory={refreshStorageData}
                  onViewResult={handleViewPastResult}
                  onStartExam={() => {
                    setDirection(-1);
                    setActiveTab('exam');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                />
              )}
              {activeTab === 'bank' && (
                <QuestionBankBrowser
                  questions={allQuestions}
                  onPracticeFiltered={qs =>
                    handleStartPracticeWithQuestions(qs, 'Luyện tập bộ câu hỏi lọc')
                  }
                  filterBookmarksOnly={filterBookmarksOnly}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer (hidden during active exam) */}
      {!isCurrentlyInExam && (
        <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#090d16] py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>
              Hệ thống Luyện thi Trắc nghiệm SQA Pro Max • Đánh giá & Kiểm định chất lượng phần mềm
            </p>
            <p className="text-slate-400 dark:text-slate-500">
              Tổng cộng <strong>{allQuestions.length} câu hỏi</strong> chuẩn • Tự động chấm điểm & Lưu lịch sử
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
