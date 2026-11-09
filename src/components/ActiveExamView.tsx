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
  Info
} from 'lucide-react';
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
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(session.remainingSeconds);

  const sessionRef = useRef<ActiveExamSession>(session);
  sessionRef.current = session;

  const currentQuestion: Question | undefined = session.questions[currentIndex];
  const totalQuestions = session.questions.length;
  const answeredCount = Object.keys(session.userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Non-stale timer interval
  useEffect(() => {
    if (session.totalDurationSeconds <= 0) return; // Untimed exam

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

  // Keyboard navigation & option selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal || zoomedImage) return;

      if ((e.key === 'ArrowRight' || e.key === 'Enter') && currentIndex < totalQuestions - 1) {
        handleGoToQuestion(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handleGoToQuestion(currentIndex - 1);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        handleSelectOption(parseInt(e.key, 10));
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        const map: Record<string, number> = { a: 1, b: 2, c: 3, d: 4, A: 1, B: 2, C: 3, D: 4 };
        handleSelectOption(map[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, showSubmitModal, zoomedImage]);

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

  // Helper styles
  const isTimeCritical = session.totalDurationSeconds > 0 && remainingSeconds < 300; // < 5 mins
  const isTimePulsing = session.totalDurationSeconds > 0 && remainingSeconds < 60; // < 1 min

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Sticky Top HUD Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Mode & Question Index */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              title="Danh sách câu hỏi"
            >
              <Grid className="w-4 h-4 text-indigo-600" />
              <span>Câu {currentIndex + 1}/{totalQuestions}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {session.config.title}
              </span>
              <span className="text-xs text-slate-500">
                (Đã làm: <strong className="text-slate-800">{answeredCount}</strong>/{totalQuestions})
              </span>
            </div>
          </div>

          {/* Center: Countdown Timer */}
          <div className="flex items-center gap-2">
            {session.totalDurationSeconds > 0 ? (
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold font-mono transition-all ${
                  isTimePulsing
                    ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                    : isTimeCritical
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(remainingSeconds)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium px-2.5 py-1 rounded-full bg-slate-100">
                <Clock className="w-3.5 h-3.5" />
                <span>Không giới hạn giờ</span>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                currentQuestion && session.flaggedQuestions[currentQuestion.id]
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Đánh dấu câu này để xem lại"
            >
              <Bookmark className={`w-3.5 h-3.5 ${currentQuestion && session.flaggedQuestions[currentQuestion.id] ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">
                {currentQuestion && session.flaggedQuestions[currentQuestion.id] ? 'Đã đánh dấu' : 'Đánh dấu'}
              </span>
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp Bài</span>
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Jump Drawer / Matrix */}
      {showMatrix && (
        <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6 shadow-md animate-fadeIn">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-xs">
                <span className="font-bold text-slate-700">Bảng điều hướng câu hỏi:</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Đã làm ({answeredCount})
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Chưa làm ({unansweredCount})
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Đánh dấu ({Object.values(session.flaggedQuestions).filter(Boolean).length})
                </span>
              </div>
              <button
                onClick={() => setShowMatrix(false)}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 gap-1.5 max-h-56 overflow-y-auto p-1">
              {session.questions.map((q, idx) => {
                const isAnswered = session.userAnswers[q.id] !== undefined;
                const isFlagged = session.flaggedQuestions[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      handleGoToQuestion(idx);
                      setShowMatrix(false);
                    }}
                    className={`h-8 text-xs font-bold rounded-md flex items-center justify-center transition-all relative ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 font-extrabold z-10 scale-105'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Question Arena */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:px-6">
        {currentQuestion ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Question Header Card */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-600 text-white">
                  Câu {currentIndex + 1}
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  Mã: #{currentQuestion.code}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {currentQuestion.cdr}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    currentQuestion.difficulty === 'DỄ'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentQuestion.difficulty === 'TRUNG BÌNH'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  • {currentQuestion.groupName}
                </span>
              </div>

              <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                {currentQuestion.topic}
              </span>
            </div>

            {/* Question Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Question Text with Markdown/Code formatting */}
              <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                <FormattedQuestionText text={currentQuestion.question} />
              </div>

              {/* Diagram Image (if any) */}
              {currentQuestion.diagramUrl && (
                <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <div className="relative group cursor-pointer inline-block">
                    <img
                      src={currentQuestion.diagramUrl}
                      alt="Sơ đồ câu hỏi"
                      className="max-h-80 w-auto rounded-lg shadow-xs object-contain border border-slate-200 bg-white"
                      onClick={() => setZoomedImage(currentQuestion.diagramUrl!)}
                    />
                    <button
                      onClick={() => setZoomedImage(currentQuestion.diagramUrl!)}
                      className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium flex items-center gap-1 shadow-md transition-opacity"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Phóng to sơ đồ</span>
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 mt-2 italic">
                    Nhấp vào hình ảnh để xem sơ đồ phóng to
                  </span>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map(option => {
                  const isSelected = session.userAnswers[currentQuestion.id] === option.id;
                  const isPractice = session.config.immediateFeedback;
                  const isAnswered = session.userAnswers[currentQuestion.id] !== undefined;

                  let optStyles = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800';

                  if (isSelected) {
                    optStyles = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-600';
                  }

                  if (isPractice && isAnswered) {
                    if (option.id === currentQuestion.correctOption) {
                      optStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 font-semibold';
                    } else if (isSelected && option.id !== currentQuestion.correctOption) {
                      optStyles = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500 line-through';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer group ${optStyles}`}
                    >
                      {/* Option Label Circle (A, B, C, D) */}
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        } ${
                          isPractice && isAnswered && option.id === currentQuestion.correctOption
                            ? 'bg-emerald-600 text-white'
                            : ''
                        } ${
                          isPractice && isAnswered && isSelected && option.id !== currentQuestion.correctOption
                            ? 'bg-rose-600 text-white'
                            : ''
                        }`}
                      >
                        {option.label}
                      </span>

                      {/* Option Text */}
                      <div className="flex-1 text-sm sm:text-base pt-0.5 leading-snug">
                        {option.text}
                      </div>

                      {/* Check indicator */}
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback Explanation in Practice Mode */}
              {session.config.immediateFeedback &&
                session.userAnswers[currentQuestion.id] !== undefined && (
                  <div
                    className={`mt-4 p-4 rounded-xl border text-sm animate-fadeIn ${
                      session.userAnswers[currentQuestion.id] === currentQuestion.correctOption
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {session.userAnswers[currentQuestion.id] === currentQuestion.correctOption ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Chính xác! Đáp án đúng là {String.fromCharCode(64 + currentQuestion.correctOption)}.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                          <span>Chưa chính xác! Đáp án đúng phải là {String.fromCharCode(64 + currentQuestion.correctOption)}.</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-1">
                      Chủ đề: <strong>{currentQuestion.topic}</strong> ({currentQuestion.groupName} - {currentQuestion.cdr}).
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-medium">Bấm phím Enter hoặc nút bên cạnh để làm câu tiếp theo</span>
                      {currentIndex < totalQuestions - 1 ? (
                        <button
                          onClick={() => handleGoToQuestion(currentIndex + 1)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <span>Làm tiếp câu sau</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowSubmitModal(true)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <span>Hoàn thành & Xem điểm</span>
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Bottom Nav inside question card */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => handleGoToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu Trước</span>
              </button>

              <div className="flex items-center gap-2">
                {unansweredCount > 0 && (
                  <button
                    onClick={handleGoToNextUnanswered}
                    className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <span>Sang câu chưa làm</span>
                  </button>
                )}

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => handleGoToQuestion(currentIndex + 1)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                  >
                    <span>Câu Tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    <span>Nộp Bài</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal: Submit Confirmation */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Xác Nhận Nộp Bài Thi?
            </h3>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tổng số câu:</span>
                <strong className="text-slate-900">{totalQuestions} câu</strong>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Số câu đã trả lời:</span>
                <strong className="font-bold">{answeredCount} câu</strong>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Số câu chưa trả lời:</span>
                <strong className="font-bold">{unansweredCount} câu</strong>
              </div>
              {session.totalDurationSeconds > 0 && (
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                  <span>Thời gian còn lại:</span>
                  <strong className="text-amber-700">{formatTime(remainingSeconds)}</strong>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-4">
                Lưu ý: Bạn vẫn còn <strong>{unansweredCount} câu hỏi</strong> chưa điền đáp án.
                Các câu này sẽ được tính là 0 điểm.
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Làm tiếp
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  onSubmitExam();
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Xác Nhận Nộp & Chấm Điểm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Zoomed Diagram Image */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 shadow-2xl overflow-auto">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImage}
              alt="Sơ đồ chi tiết"
              className="max-h-[80vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
