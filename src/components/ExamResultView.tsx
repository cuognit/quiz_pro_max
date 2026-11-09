import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Bookmark,
  Share2,
  Home,
  Check,
  TrendingUp,
  Zap,
  Play,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamResult } from '../types/quiz';
import { formatTime, getGradeEvaluation } from '../utils/examEngine';
import { toggleBookmarkStorage, getBookmarks } from '../utils/storage';
import { FormattedQuestionText } from './FormattedQuestionText';

interface ExamResultViewProps {
  result: ExamResult;
  onRetakeSameExam: () => void;
  onStartNewExam: () => void;
  onContinueIncompleteExam?: () => void;
  onPracticeMistakes: (wrongQuestions: any[]) => void;
  onGoHome: () => void;
  onBackToHistory?: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  result,
  onRetakeSameExam,
  onStartNewExam,
  onContinueIncompleteExam,
  onPracticeMistakes,
  onGoHome,
  onBackToHistory
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'skipped' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarks());
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  const evalInfo = getGradeEvaluation(result.score10);

  // Trigger confetti if score is good
  useEffect(() => {
    if (result.score10 >= 5.0) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [result.score10]);

  const handleToggleBookmark = (qId: string) => {
    toggleBookmarkStorage(qId);
    setBookmarkedIds(getBookmarks());
  };

  const handleShare = () => {
    const text = `Tôi vừa đạt ${result.score10}/10 điểm (${result.correctCount}/${result.totalQuestions} câu) bài thi trắc nghiệm môn Đánh giá và kiểm định chất lượng phần mềm (SQA)!`;
    navigator.clipboard?.writeText(text);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  // Filter details
  const filteredDetails = result.details.filter(d => {
    if (filter === 'wrong' && (d.isCorrect || d.isSkipped)) return false;
    if (filter === 'correct' && !d.isCorrect) return false;
    if (filter === 'skipped' && !d.isSkipped) return false;
    if (filter === 'flagged' && !bookmarkedIds.includes(d.question.id)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (d.question.question + ' ' + d.question.code + ' ' + d.question.topic).toLowerCase();
      return matchText.includes(q);
    }
    return true;
  });

  const wrongQuestions = result.details
    .filter(d => !d.isCorrect && !d.isSkipped)
    .map(d => d.question);

  const secondsPerQuestion =
    result.totalQuestions > 0 ? (result.timeSpentSeconds / result.totalQuestions).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBackToHistory || onGoHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#152230] dark:text-[#f4f8fd] bg-white dark:bg-[#1c2c3d] hover:bg-[#e6f1fc] dark:hover:bg-[#233446] border border-[#dceeff] dark:border-[#2e4359] transition-all shadow-xs group"
        >
          <ArrowLeft className="w-4 h-4 text-[#4f80b9] dark:text-[#7da7d9] group-hover:-translate-x-1 transition-transform" />
          <span>{onBackToHistory ? 'Quay Lại Lịch Sử Làm Bài' : 'Quay Lại'}</span>
        </button>
      </div>

      {/* Hero Score Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#152230] via-[#1c2c3d] to-[#152230] text-white p-6 sm:p-10 border border-[#2e4359] shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#4f80b9]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#fff7cc]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: General Assessment */}
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#4f80b9]/20 text-[#dceeff] border border-[#7da7d9]/30 backdrop-blur-md">
              <Award className="w-3.5 h-3.5 text-[#fff7cc]" />
              Báo Cáo Đánh Giá Kết Quả Bài Kiểm Tra
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {result.title}
            </h1>

            <p className="text-[#dceeff]/85 text-sm sm:text-base leading-relaxed">
              {evalInfo.feedback}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/10 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <Clock className="w-4 h-4 text-[#7da7d9]" />
                Thời gian: <strong className="text-white font-mono">{formatTime(result.timeSpentSeconds)}</strong>
              </span>

              <span className="flex items-center gap-1.5 bg-white/10 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <Zap className="w-4 h-4 text-[#fff7cc]" />
                Tốc độ: <strong className="text-white font-mono">{secondsPerQuestion}s/câu</strong>
              </span>

              <span className="flex items-center gap-1.5 bg-white/10 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Độ chính xác: <strong className="text-white font-mono">{result.percentage}%</strong>
              </span>
            </div>
          </div>

          {/* Right: Score Gauge Dial */}
          <div className="flex flex-col items-center justify-center bg-white/5 p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-inner text-center shrink-0 min-w-[240px]">
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#dceeff] mb-1">
              Điểm Số Đạt Được
            </span>
            <div className="flex items-baseline justify-center gap-1 text-white my-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                {result.score10.toFixed(1)}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-400">/ 10</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                  result.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-[#c25e5e]/20 text-[#f0a8a8] border border-[#c25e5e]/30'
                }`}
              >
                {result.passed ? 'ĐẠT CHUẨN' : 'CHƯA ĐẠT'} ({evalInfo.label})
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-3 font-medium">
              Đúng: <strong className="text-emerald-400">{result.correctCount}</strong> • Sai: <strong className="text-[#f0a8a8]">{result.incorrectCount}</strong> • Bỏ qua: <strong className="text-slate-400">{result.skippedCount}</strong>
            </p>
          </div>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {result.skippedCount > 0 && onContinueIncompleteExam && (
              <button
                onClick={onContinueIncompleteExam}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all hover:scale-102 ring-2 ring-amber-400/50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Làm Tiếp ({result.skippedCount} câu chưa làm)</span>
              </button>
            )}

            {wrongQuestions.length > 0 && (
              <button
                onClick={() => onPracticeMistakes(wrongQuestions)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c25e5e] hover:bg-[#b04f4f] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Luyện Tập Lại {wrongQuestions.length} Câu Sai</span>
              </button>
            )}

            <button
              onClick={onStartNewExam}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f80b9] hover:bg-[#4372a7] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Làm Đề Thi Mới</span>
            </button>

            <button
              onClick={onRetakeSameExam}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm Lại Đề Này</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition-colors"
              title="Sao chép kết quả"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{showShareToast ? 'Đã sao chép!' : 'Chia sẻ điểm'}</span>
            </button>

            {onBackToHistory && (
              <button
                onClick={onBackToHistory}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
                title="Quay lại danh sách lịch sử bài thi"
              >
                <History className="w-3.5 h-3.5" />
                <span>Quay Lại Lịch Sử</span>
              </button>
            )}

            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Về Trang Chủ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Diagnostic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown by Learning Outcome (CĐR) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Theo Chuẩn Đầu Ra (CĐR)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Học phần SQA</span>
          </div>

          <div className="space-y-4">
            {Object.entries(result.breakdownByCdr).map(([cdr, stat]) => (
              <div key={cdr} className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cdr} ({cdr === 'CĐR 1.1' ? 'Lý thuyết & Kỹ thuật' : 'Thực hành & Công cụ'})
                  </span>
                  <span className="font-bold text-[#4f80b9] dark:text-[#7da7d9] font-mono">
                    {stat.correct}/{stat.total} câu ({stat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.percentage >= 70
                        ? 'bg-emerald-500'
                        : stat.percentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-[#c25e5e]'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown by Difficulty */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Theo Mức Độ Khó
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dễ / Trung Bình / Khó</span>
          </div>

          <div className="space-y-4">
            {(['DỄ', 'TRUNG BÌNH', 'KHÓ'] as const).map(diff => {
              const stat = result.breakdownByDifficulty[diff] || { total: 0, correct: 0, percentage: 0 };
              if (stat.total === 0) return null;
              return (
                <div key={diff} className="space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          diff === 'DỄ'
                            ? 'bg-emerald-500'
                            : diff === 'TRUNG BÌNH'
                            ? 'bg-amber-500'
                            : 'bg-[#c25e5e]'
                        }`}
                      />
                      Mức độ {diff}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {stat.correct}/{stat.total} câu ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.percentage >= 70
                          ? 'bg-emerald-500'
                          : stat.percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-[#c25e5e]'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question by Question Detailed Review */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Chi Tiết Từng Câu Hỏi & Đáp Án
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Xem lại các câu bạn đã làm đúng, sai hoặc bỏ qua kèm đáp án chuẩn từ ngân hàng
            </p>
          </div>

          {/* Search inside review */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo từ khóa, mã câu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#152230] border border-slate-200 dark:border-[#2e4359] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f80b9] text-slate-900 dark:text-[#f4f8fd] placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-[#4f80b9] text-white'
                : 'bg-slate-100 dark:bg-[#233446] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2e4359]'
            }`}
          >
            Tất cả ({result.totalQuestions})
          </button>

          <button
            onClick={() => setFilter('wrong')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filter === 'wrong'
                ? 'bg-[#c25e5e] text-white'
                : 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border border-[#f5c6cb] dark:border-[#522b34] hover:bg-[#fbd5d8]'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Câu làm sai ({result.incorrectCount})</span>
          </button>

          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filter === 'correct'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Câu đúng ({result.correctCount})</span>
          </button>

          {result.skippedCount > 0 && (
            <button
              onClick={() => setFilter('skipped')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === 'skipped'
                  ? 'bg-slate-700 text-white dark:bg-slate-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Chưa làm ({result.skippedCount})
            </button>
          )}

          <button
            onClick={() => setFilter('flagged')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filter === 'flagged'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Đã đánh dấu</span>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredDetails.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredDetails.map((item, index) => {
              const q = item.question;
              const isBookmarked = bookmarkedIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    item.isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900/80'
                      : item.isSkipped
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
                      : 'border-[#f5c6cb] dark:border-[#522b34] bg-white dark:bg-[#1c2c3d]'
                  }`}
                >
                  {/* Question Tag Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                          item.isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : item.isSkipped
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border border-[#f5c6cb] dark:border-[#522b34]'
                        }`}
                      >
                        {item.isCorrect ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Đúng (+{(10 / result.totalQuestions).toFixed(2)}đ)
                          </>
                        ) : item.isSkipped ? (
                          <>Chưa làm (0đ)</>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Sai (0đ)
                          </>
                        )}
                      </span>

                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        #{q.code}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {q.groupName} • {q.cdr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {q.topic}
                      </span>
                      <button
                        onClick={() => handleToggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title="Đánh dấu câu này"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                    <FormattedQuestionText text={q.question} />
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 mb-3">
                    {q.options.map(option => {
                      const isUserChoice = item.userAnswer === option.id;
                      const isCorrectAnswer = q.correctOption === option.id;

                      let rowStyle = 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';

                      if (isCorrectAnswer) {
                        rowStyle = 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-medium';
                      } else if (isUserChoice && !isCorrectAnswer) {
                        rowStyle = 'border-[#f5c6cb] dark:border-[#522b34] bg-[#fdf2f4]/80 dark:bg-[#351e24]/60 text-[#8e3535] dark:text-[#f0a8a8] line-through';
                      }

                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${rowStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrectAnswer
                                ? 'bg-emerald-600 text-white'
                                : isUserChoice
                                ? 'bg-[#c25e5e] text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="flex-1 pt-0.5">{option.text}</span>
                          {isCorrectAnswer && (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đáp án chuẩn
                            </span>
                          )}
                          {isUserChoice && !isCorrectAnswer && (
                            <span className="text-[11px] font-bold text-[#b04848] dark:text-[#f0a8a8] flex items-center gap-1 shrink-0">
                              <XCircle className="w-3.5 h-3.5" />
                              Lựa chọn của bạn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
