import React, { useState, useEffect } from 'react';
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

const allQuestions = questionsData as Question[];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('exam');
  const [activeSession, setActiveSession] = useState<ActiveExamSession | null>(null);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [mistakes, setMistakes] = useState(getMistakeRecords());
  const [bookmarks, setBookmarks] = useState<string[]>(getBookmarks());

  // Load storage state on mount
  useEffect(() => {
    const savedSession = getActiveSession();
    if (savedSession) {
      setActiveSession(savedSession);
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
    setCurrentResult(null);
    setActiveTab('exam');
  };

  // Start targeted practice with specific questions (e.g. from mistakes or filtered bank)
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
    setCurrentResult(result);
    refreshStorageData();
  };

  // Discard in-progress session
  const handleDiscardSession = () => {
    if (window.confirm('Bạn có chắc muốn hủy bỏ bài thi đang làm dở này?')) {
      clearActiveSession();
      setActiveSession(null);
    }
  };

  // View past result
  const handleViewPastResult = (result: ExamResult) => {
    setCurrentResult(result);
  };

  // Exit result view
  const handleGoHome = () => {
    setCurrentResult(null);
    setActiveTab('exam');
  };

  const mistakesCount = Object.values(mistakes).filter(m => !m.resolved).length;
  const bookmarksCount = bookmarks.length;
  const historyCount = history.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={tab => {
          setCurrentResult(null);
          setActiveTab(tab);
        }}
        mistakesCount={mistakesCount}
        bookmarksCount={bookmarksCount}
        historyCount={historyCount}
      />

      {/* In-Progress Exam Banner (shown when user is browsing other tabs while having an ongoing test) */}
      {activeSession && !activeSession.isCompleted && activeTab !== 'exam' && (
        <ResumeBanner
          session={activeSession}
          onResume={() => {
            setCurrentResult(null);
            setActiveTab('exam');
          }}
          onDiscard={handleDiscardSession}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeSession && activeTab === 'exam' ? (
          /* Active Exam View */
          <ActiveExamView
            session={activeSession}
            onUpdateSession={handleUpdateSession}
            onSubmitExam={handleSubmitExam}
            onExitExam={() => setActiveTab('bank')}
          />
        ) : currentResult ? (
          /* Exam Result View */
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
          />
        ) : activeTab === 'exam' || activeTab === 'practice' ? (
          /* Setup Exam / Practice View */
          <ExamSetupView
            questions={allQuestions}
            onStartExam={handleStartExam}
            defaultMode={activeTab === 'practice' ? 'practice' : 'standard'}
          />
        ) : activeTab === 'mistakes' ? (
          /* Mistake Bank View */
          <MistakesView
            questions={allQuestions}
            mistakes={mistakes}
            onRefreshMistakes={refreshStorageData}
            onPracticeMistakes={qs =>
              handleStartPracticeWithQuestions(qs, 'Khắc phục câu hỏi làm sai')
            }
            onGoToBank={() => setActiveTab('bank')}
          />
        ) : activeTab === 'history' ? (
          /* Exam History View */
          <HistoryView
            history={history}
            questions={allQuestions}
            onRefreshHistory={refreshStorageData}
            onViewResult={handleViewPastResult}
            onStartExam={() => setActiveTab('exam')}
          />
        ) : activeTab === 'bank' || activeTab === 'bookmarks' ? (
          /* Question Bank / Bookmarks Browser */
          <QuestionBankBrowser
            questions={allQuestions}
            onPracticeFiltered={qs =>
              handleStartPracticeWithQuestions(qs, 'Luyện tập bộ câu hỏi lọc')
            }
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Hệ thống Luyện thi Trắc nghiệm SQA • Đánh giá & Kiểm định chất lượng phần mềm
          </p>
          <p className="text-slate-400">
            Tổng cộng <strong>{allQuestions.length} câu hỏi</strong> chuẩn • Tự động chấm điểm & Lưu lịch sử
          </p>
        </div>
      </footer>
    </div>
  );
}
