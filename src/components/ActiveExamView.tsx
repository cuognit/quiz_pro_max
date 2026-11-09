import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  Grid,
  AlertTriangle,
  ZoomIn,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  CornerDownRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveExamSession, Question } from '../types/quiz';
import { formatTime } from '../utils/examEngine';
import { saveActiveSession } from '../utils/storage';
import { FormattedQuestionText } from './FormattedQuestionText';

interface ActiveExamViewProps {
  session: ActiveExamSession;
  onUpdateSession: (updated: ActiveExamSession) => void;
  onSubmitExam: () => void;
  onExitExam: () => void;
}

export const ActiveExamView: React.FC<ActiveExamViewProps> = ({
  session,
  onUpdateSession,
  onSubmitExam,
  onExitExam
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(session.currentQuestionIndex || 0);
  const [showMobileMatrix, setShowMobileMatrix] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(session.remainingSeconds);

  const sessionRef = useRef<ActiveExamSession>(session);
  sessionRef.current = session;

  const currentQuestion: Question | undefined = session.questions[currentIndex];
  const totalQuestions = session.questions.length;
  const answeredCount = Object.keys(session.userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = Object.values(session.flaggedQuestions).filter(Boolean).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Timer interval
  useEffect(() => {
    if (session.totalDurationSeconds <= 0) return; // Untimed practice

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        const next = Math.max(0, prev - 1);
        if (sessionRef.current) {
          sessionRef.current.remainingSeconds = next;
          saveActiveSession(sessionRef.current);
        }

        if (next === 0) {
          clearInterval(timer);
          onSubmitExam(); // Auto-submit when time is up
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session.totalDurationSeconds]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal || showExitModal || zoomedImage) {
        if (e.key === 'Escape') {
          setShowSubmitModal(false);
          setShowExitModal(false);
          setZoomedImage(null);
        }
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'J') {
        if (currentIndex < totalQuestions - 1) handleGoToQuestion(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'K') {
        if (currentIndex > 0) handleGoToQuestion(currentIndex - 1);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        handleSelectOption(parseInt(e.key, 10));
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        const map: Record<string, number> = { a: 1, b: 2, c: 3, d: 4, A: 1, B: 2, C: 3, D: 4 };
        handleSelectOption(map[e.key]);
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'b' || e.key === 'B') {
        handleToggleFlag();
      } else if (e.key === 'm' || e.key === 'M') {
        setShowMobileMatrix(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowMobileMatrix(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, showSubmitModal, showExitModal, zoomedImage]);

  const handleSelectOption = (optionId: number) => {
    if (!currentQuestion) return;

    const newAnswers = {
      ...session.userAnswers,
      [currentQuestion.id]: optionId
    };

    const updatedSession: ActiveExamSession = {
      ...session,
      userAnswers: newAnswers,
      currentQuestionIndex: currentIndex,
      lastActiveAt: Date.now()
    };

    saveActiveSession(updatedSession);
    onUpdateSession(updatedSession);
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    const isFlagged = !session.flaggedQuestions[currentQuestion.id];
    const newFlagged = {
      ...session.flaggedQuestions,
      [currentQuestion.id]: isFlagged
    };

    const updatedSession: ActiveExamSession = {
      ...session,
      flaggedQuestions: newFlagged
    };

    saveActiveSession(updatedSession);
    onUpdateSession(updatedSession);
  };

  const handleGoToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
      const updated = { ...session, currentQuestionIndex: index };
      saveActiveSession(updated);
      onUpdateSession(updated);
      setShowMobileMatrix(false);
    }
  };

  const handleGoToNextUnanswered = () => {
    for (let i = 0; i < totalQuestions; i++) {
      const q = session.questions[i];
      if (session.userAnswers[q.id] === undefined) {
        handleGoToQuestion(i);
        return;
      }
    }
  };

  const isTimeCritical = session.totalDurationSeconds > 0 && remainingSeconds < 300; // < 5 mins
  const isTimePulsing = session.totalDurationSeconds > 0 && remainingSeconds < 60; // < 1 min

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col transition-colors">
      {/* Sticky Exam HUD */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#152230]/90 backdrop-blur-md border-b border-[#dceeff] dark:border-[#293d52] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Exit button & Exam title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 rounded-xl text-[#4f80b9] hover:text-[#233446] dark:text-[#7da7d9] dark:hover:text-[#fff7cc] hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d] transition-colors"
              title="Tạm dừng hoặc thoát bài thi"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-[#1a2837] dark:text-[#f0f6fc] whitespace-nowrap">
                Câu {currentIndex + 1}
                <span className="text-[#4f80b9] dark:text-[#7da7d9] font-normal">/{totalQuestions}</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dceeff]/60 dark:bg-[#1c2c3d] text-[#233446] dark:text-[#dceeff] border border-[#dceeff] dark:border-[#293d52]">
                {session.config.title}
              </span>
            </div>
          </div>

          {/* Center: Countdown Timer */}
          <div className="flex items-center gap-2">
            {session.totalDurationSeconds > 0 ? (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold font-mono transition-all ${
                  isTimePulsing
                    ? 'bg-[#233446] text-[#fff7cc] border-2 border-[#fde047] animate-pulse'
                    : isTimeCritical
                    ? 'bg-[#fff7cc] text-[#713f12] border border-[#fde047] shadow-xs'
                    : 'bg-[#dceeff] dark:bg-[#1c2c3d] text-[#233446] dark:text-[#dceeff] border border-[#b8daf7] dark:border-[#293d52]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(remainingSeconds)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#233446] dark:text-[#dceeff] font-medium px-3 py-1 rounded-full bg-[#dceeff]/60 dark:bg-[#1c2c3d]">
                <Clock className="w-3.5 h-3.5" />
                <span>Tự do (Không giới hạn)</span>
              </div>
            )}
          </div>

          {/* Right: Flag, Question Sheet Trigger (Mobile), and Submit CTA */}
          <div className="flex items-center gap-2">
            {/* Toggle Matrix on Mobile */}
            <button
              onClick={() => setShowMobileMatrix(true)}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#dceeff] dark:border-[#293d52] text-[#233446] dark:text-[#dceeff] text-xs font-semibold hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d] transition-colors"
            >
              <Grid className="w-4 h-4 text-[#4f80b9]" />
              <span>Bảng câu</span>
            </button>

            {/* Flag / Bookmark button */}
            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currentQuestion && session.flaggedQuestions[currentQuestion.id]
                  ? 'bg-[#fff7cc] text-[#713f12] border-[#fde047] shadow-2xs'
                  : 'text-[#233446] dark:text-[#dceeff] border-[#dceeff] dark:border-[#293d52] hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d]'
              }`}
              title="Đánh dấu câu hỏi này (Phím F hoặc B)"
            >
              <Bookmark className={`w-3.5 h-3.5 ${currentQuestion && session.flaggedQuestions[currentQuestion.id] ? 'fill-[#eab308] text-[#ca8a04]' : ''}`} />
              <span className="hidden sm:inline">
                {currentQuestion && session.flaggedQuestions[currentQuestion.id] ? 'Đã ghim' : 'Ghim câu'}
              </span>
            </button>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#4f80b9] hover:bg-[#3d6e9f] active:bg-[#233446] text-[#fff7cc] text-xs sm:text-sm font-bold shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-[#dceeff]/40 dark:bg-[#1c2c3d] h-1.5">
          <div
            className="bg-gradient-to-r from-[#233446] via-[#4f80b9] to-[#fde047] h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Container - Split Layout on Desktop */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Question Arena (70%) */}
          <div className="flex-1 w-full space-y-4">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  {/* Question Header Meta */}
                  <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#4f80b9] text-white">
                        Câu {currentIndex + 1}
                      </span>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        #{currentQuestion.code}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                        {currentQuestion.cdr}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          currentQuestion.difficulty === 'DỄ'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                            : currentQuestion.difficulty === 'TRUNG BÌNH'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                            : 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border border-[#f5c6cb] dark:border-[#522b34]'
                        }`}
                      >
                        {currentQuestion.difficulty}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                        • {currentQuestion.groupName}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                      {currentQuestion.topic}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Question Text */}
                    <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                      <FormattedQuestionText text={currentQuestion.question} />
                    </div>

                    {/* Diagram Image (if any) */}
                    {currentQuestion.diagramUrl && (
                      <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center">
                        <div className="relative group cursor-pointer inline-block">
                          <img
                            src={currentQuestion.diagramUrl}
                            alt="Sơ đồ câu hỏi"
                            className="max-h-80 w-auto rounded-xl shadow-xs object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            onClick={() => setZoomedImage(currentQuestion.diagramUrl!)}
                          />
                          <button
                            onClick={() => setZoomedImage(currentQuestion.diagramUrl!)}
                            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform group-hover:scale-105"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Phóng to</span>
                          </button>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
                          Nhấp vào hình ảnh để xem sơ đồ phóng to
                        </span>
                      </div>
                    )}

                    {/* Options List with Hotkey Indicators */}
                    <div className="space-y-3 pt-2">
                      {currentQuestion.options.map((option, optIdx) => {
                        const isSelected = session.userAnswers[currentQuestion.id] === option.id;
                        const isPractice = session.config.immediateFeedback;
                        const isAnswered = session.userAnswers[currentQuestion.id] !== undefined;

                        let cardStyle =
                          'border-[#dceeff] dark:border-[#293d52] bg-white dark:bg-[#1c2c3d] hover:border-[#4f80b9] text-[#1a2837] dark:text-[#f0f6fc]';

                        if (isSelected) {
                          cardStyle =
                            'border-2 border-[#4f80b9] bg-[#dceeff]/35 dark:bg-[#233446]/60 text-[#152230] dark:text-[#fff7cc] shadow-xs font-semibold';
                        }

                        if (isPractice && isAnswered) {
                          if (option.id === currentQuestion.correctOption) {
                            cardStyle =
                              'border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs';
                          } else if (isSelected && option.id !== currentQuestion.correctOption) {
                            cardStyle =
                              'border-2 border-[#f5c6cb] dark:border-[#522b34] bg-[#fdf2f4]/90 dark:bg-[#351e24]/70 text-[#8e3535] dark:text-[#f0a8a8] line-through opacity-90';
                          }
                        }

                        return (
                          <button
                            key={option.id}
                            onClick={() => handleSelectOption(option.id)}
                            className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all duration-150 cursor-pointer group hover:scale-[1.006] ${cardStyle}`}
                          >
                            {/* Option Circle Label (A, B, C, D) */}
                            <span
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-[#4f80b9] text-white shadow-xs'
                                  : 'bg-[#dceeff]/60 dark:bg-[#152230] text-[#233446] dark:text-[#dceeff] group-hover:bg-[#4f80b9] group-hover:text-white'
                              } ${
                                isPractice && isAnswered && option.id === currentQuestion.correctOption
                                  ? 'bg-emerald-600 text-white font-black'
                                  : ''
                              } ${
                                isPractice && isAnswered && isSelected && option.id !== currentQuestion.correctOption
                                  ? 'bg-[#c25e5e] text-white font-black'
                                  : ''
                              }`}
                            >
                              {option.label}
                            </span>

                            {/* Option Text */}
                            <div className="flex-1 text-sm sm:text-base pt-1 leading-relaxed">
                              {option.text}
                            </div>

                            {/* Hotkey hint indicator & checkmark */}
                            <div className="flex items-center gap-2 shrink-0 pt-1">
                              {isSelected ? (
                                <CheckCircle2 className="w-5 h-5 text-[#4f80b9] dark:text-[#7da7d9]" />
                              ) : (
                                <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md border border-[#dceeff] dark:border-[#293d52] text-[#4f80b9] dark:text-[#7da7d9] opacity-70 group-hover:opacity-100">
                                  {optIdx + 1}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Immediate Feedback in Practice Mode */}
                    {session.config.immediateFeedback && session.userAnswers[currentQuestion.id] !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-4 rounded-2xl border text-sm ${
                          session.userAnswers[currentQuestion.id] === currentQuestion.correctOption
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/60 text-emerald-900 dark:text-emerald-100 shadow-xs'
                            : 'bg-[#fdf2f4] dark:bg-[#351e24] border-[#f5c6cb] dark:border-[#522b34] text-[#8e3535] dark:text-[#f0a8a8] shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold mb-1">
                          {session.userAnswers[currentQuestion.id] === currentQuestion.correctOption ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              <span>Chính xác! Đáp án chuẩn là {String.fromCharCode(64 + currentQuestion.correctOption)}.</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-5 h-5 text-[#c25e5e] dark:text-[#f0a8a8]" />
                              <span>Chưa chính xác! Đáp án chuẩn phải là {String.fromCharCode(64 + currentQuestion.correctOption)}.</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-inherit opacity-90 mt-1">
                          Chủ đề: <strong>{currentQuestion.topic}</strong> ({currentQuestion.groupName} - {currentQuestion.cdr}).
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bấm phím mũi tên hoặc nút bên dưới để sang câu kế tiếp</span>
                          {currentIndex < totalQuestions - 1 ? (
                            <button
                              onClick={() => handleGoToQuestion(currentIndex + 1)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#4f80b9] hover:bg-[#4372a7] active:bg-[#396395] text-white flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <span>Làm tiếp câu sau</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowSubmitModal(true)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <span>Hoàn thành & Nộp bài</span>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Card Navigation Footer */}
                  <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                    <button
                      onClick={() => handleGoToQuestion(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Câu Trước</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {unansweredCount > 0 && (
                        <button
                          onClick={handleGoToNextUnanswered}
                          className="hidden sm:inline-flex items-center gap-1 text-xs text-[#4f80b9] dark:text-[#7da7d9] font-semibold px-3 py-2 rounded-xl bg-[#e6f1fc] dark:bg-[#152230] border border-[#d0e4f7] dark:border-[#2e4359] hover:bg-[#dceeff] dark:hover:bg-[#233446] transition-colors"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Câu chưa làm ({unansweredCount})</span>
                        </button>
                      )}

                      {currentIndex < totalQuestions - 1 ? (
                        <button
                          onClick={() => handleGoToQuestion(currentIndex + 1)}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#4f80b9] hover:bg-[#4372a7] active:bg-[#396395] text-white shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <span>Câu Tiếp Theo</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowSubmitModal(true)}
                          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <span>Nộp Bài Thi</span>
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Shortcuts Helper Pill */}
            <div className="hidden lg:flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-2">
              <div className="flex items-center gap-3">
                <span>Phím tắt:</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">1-4</kbd> Chọn đáp án</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">← / →</kbd> Chuyển câu</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">F</kbd> Đánh dấu</span>
              </div>
              <span>SQA Quiz Pro Max</span>
            </div>
          </div>

          {/* Right Column: Sticky Question Matrix Sidebar (30% on Desktop) */}
          <aside className="hidden lg:block w-80 shrink-0 sticky top-20 self-start">
            <div className="rounded-3xl bg-white dark:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#293d52] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#152230] dark:text-[#f4f8fd] flex items-center gap-2">
                  <Grid className="w-4 h-4 text-[#4f80b9] dark:text-[#7da7d9]" />
                  Bảng Danh Sách Câu Hỏi
                </h3>
                <span className="text-xs font-mono font-bold text-[#4f80b9] dark:text-[#7da7d9]">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-md bg-[#4f80b9] shrink-0" />
                  <span>Đã làm ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />
                  <span>Chưa làm ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-md bg-[#fde047] border border-amber-400 shrink-0" />
                  <span>Đánh dấu ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-md border-2 border-[#4f80b9] shrink-0" />
                  <span>Đang xem</span>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-[52vh] overflow-y-auto p-2.5 rounded-2xl bg-slate-50/60 dark:bg-[#152230]/60 border border-slate-100 dark:border-[#293d52] scrollbar-thin">
                {session.questions.map((q, idx) => {
                  const isAnswered = session.userAnswers[q.id] !== undefined;
                  const isFlagged = session.flaggedQuestions[q.id];
                  const isCurrent = idx === currentIndex;

                  let cellStyle =
                    'bg-slate-100 dark:bg-[#233446] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2e4359] border border-transparent';

                  if (isAnswered) {
                    cellStyle = 'bg-[#4f80b9] text-white border border-transparent shadow-xs';
                  }

                  if (isCurrent) {
                    cellStyle = isAnswered
                      ? 'bg-[#4f80b9] text-white border-2 border-[#152230] dark:border-white shadow-md font-black'
                      : 'bg-[#dceeff] dark:bg-[#233446] text-[#152230] dark:text-[#fff7cc] border-2 border-[#4f80b9] dark:border-[#7da7d9] shadow-sm font-black';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleGoToQuestion(idx)}
                      className={`h-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all relative ${cellStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white dark:border-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Matrix Quick Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {unansweredCount > 0 && (
                  <button
                    onClick={handleGoToNextUnanswered}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-[#4f80b9] dark:text-[#7da7d9] bg-[#e6f1fc] dark:bg-[#152230] hover:bg-[#dceeff] dark:hover:bg-[#233446] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Nhảy đến câu chưa làm</span>
                  </button>
                )}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Nộp bài & Chấm điểm</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Sticky Bar */}
      <div className="lg:hidden sticky bottom-0 z-20 bg-white/95 dark:bg-[#1c2c3d]/95 backdrop-blur-md border-t border-[#dceeff] dark:border-[#2e4359] px-4 py-2.5 flex items-center justify-between gap-2 shadow-lg">
        <button
          onClick={() => handleGoToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Trước</span>
        </button>

        <button
          onClick={() => setShowMobileMatrix(true)}
          className="flex-1 py-2 px-3 rounded-xl bg-[#e6f1fc] dark:bg-[#152230] text-xs font-extrabold text-[#4f80b9] dark:text-[#7da7d9] flex items-center justify-center gap-1"
        >
          <Grid className="w-4 h-4" />
          <span>{currentIndex + 1}/{totalQuestions}</span>
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={() => handleGoToQuestion(currentIndex + 1)}
            className="flex-1 py-2 px-3 rounded-xl bg-[#4f80b9] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
          >
            <span>Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
          >
            <span>Nộp</span>
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Question Bottom-Sheet Modal */}
      {showMobileMatrix && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="flex-1"
            onClick={() => setShowMobileMatrix(false)}
          />
          <div className="bg-white dark:bg-[#1c2c3d] rounded-t-3xl max-h-[75vh] flex flex-col border-t border-[#dceeff] dark:border-[#2e4359] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#4f80b9] dark:text-[#7da7d9]" />
                <h3 className="font-extrabold text-sm text-[#152230] dark:text-[#f4f8fd]">
                  Bảng Lưới Câu Hỏi ({answeredCount}/{totalQuestions})
                </h3>
              </div>
              <button
                onClick={() => setShowMobileMatrix(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 p-3 my-2 overflow-y-auto flex-1 rounded-2xl bg-slate-50/60 dark:bg-[#152230]/60 border border-slate-100 dark:border-[#2e4359]">
              {session.questions.map((q, idx) => {
                const isAnswered = session.userAnswers[q.id] !== undefined;
                const isFlagged = session.flaggedQuestions[q.id];
                const isCurrent = idx === currentIndex;

                let cellStyle =
                  'bg-slate-100 dark:bg-[#233446] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2e4359] border border-transparent';

                if (isAnswered) {
                  cellStyle = 'bg-[#4f80b9] text-white border border-transparent shadow-xs';
                }

                if (isCurrent) {
                  cellStyle = isAnswered
                    ? 'bg-[#4f80b9] text-white border-2 border-[#152230] dark:border-white shadow-md font-black'
                    : 'bg-[#dceeff] dark:bg-[#233446] text-[#152230] dark:text-[#fff7cc] border-2 border-[#4f80b9] dark:border-[#7da7d9] shadow-sm font-black';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleGoToQuestion(idx)}
                    className={`h-10 text-xs font-bold rounded-xl flex items-center justify-center transition-all relative ${cellStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white dark:border-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  setShowMobileMatrix(false);
                  setShowSubmitModal(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xs"
              >
                Nộp bài & Chấm điểm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exit Confirmation */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <LogOut className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Tạm Dừng Hoặc Thoát Bài Thi?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
                Hệ thống sẽ <strong>tự động lưu tiến trình</strong> của bạn. Bạn có thể quay lại làm tiếp bất kỳ lúc nào từ thanh thông báo bài dở dang trên trang chủ.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Tiếp tục thi
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    onExitExam();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#4f80b9] hover:bg-[#4372a7] transition-colors shadow-xs"
                >
                  Lưu & Thoát Ra Ngoài
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Submit Confirmation */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="bg-white dark:bg-[#1c2c3d] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#dceeff] dark:border-[#2e4359]"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-[#152230] dark:text-[#f4f8fd] mb-2">
                Xác Nhận Nộp Bài & Chấm Điểm?
              </h3>

              <div className="bg-slate-50 dark:bg-[#152230]/60 rounded-2xl p-4 border border-slate-200/80 dark:border-[#2e4359] mb-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tổng số câu:</span>
                  <strong className="text-[#152230] dark:text-[#f4f8fd]">{totalQuestions} câu</strong>
                </div>
                <div className="flex justify-between text-[#4f80b9] dark:text-[#7da7d9]">
                  <span>Số câu đã hoàn thành:</span>
                  <strong className="font-bold">{answeredCount} câu ({progressPercent}%)</strong>
                </div>
                <div className="flex justify-between text-[#b04848] dark:text-[#f0a8a8]">
                  <span>Số câu chưa trả lời:</span>
                  <strong className="font-bold">{unansweredCount} câu</strong>
                </div>
                {session.totalDurationSeconds > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Thời gian còn lại:</span>
                    <strong className="text-amber-600 dark:text-amber-400 font-mono">{formatTime(remainingSeconds)}</strong>
                  </div>
                )}
              </div>

              {unansweredCount > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200/80 dark:border-amber-800/60 mb-4 leading-relaxed">
                  Lưu ý: Bạn vẫn còn <strong>{unansweredCount} câu hỏi</strong> chưa điền đáp án. Các câu này sẽ được tính là 0 điểm.
                </p>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Làm tiếp
                </button>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    onSubmitExam();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xs"
                >
                  Xác Nhận Nộp Bài
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Zoomed Diagram Image */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 cursor-pointer"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-auto"
            >
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomedImage}
                alt="Sơ đồ chi tiết"
                className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
