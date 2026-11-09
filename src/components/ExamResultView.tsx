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
  Sparkles
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
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  result,
  onRetakeSameExam,
  onStartNewExam,
  onContinueIncompleteExam,
  onPracticeMistakes,
  onGoHome
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
          particleCount: 80,
          spread: 70,
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-8 animate-fadeIn">
      {/* Hero Score Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left info */}
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-indigo-300 border border-white/10 backdrop-blur-xs">
              <Award className="w-3.5 h-3.5" />
              Báo cáo kết quả bài kiểm tra
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {result.title}
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              {evalInfo.feedback}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-4 h-4 text-indigo-400" />
                Thời gian: <strong className="text-white">{formatTime(result.timeSpentSeconds)}</strong>
              </span>

              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Zap className="w-4 h-4 text-amber-400" />
                Tốc độ: <strong className="text-white">{secondsPerQuestion}s/câu</strong>
              </span>

              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Chính xác: <strong className="text-white">{result.percentage}%</strong>
              </span>
            </div>
          </div>

          {/* Right score circle */}
          <div className="flex flex-col items-center justify-center bg-white/5 p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-inner text-center shrink-0 min-w-[220px]">
            <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-300 mb-1">
              Điểm số của bạn
            </span>
            <div className="flex items-baseline justify-center gap-1 text-white">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                {result.score10.toFixed(1)}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-400">/ 10</span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                  result.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                }`}
              >
                {result.passed ? 'ĐẠT CHUẨN' : 'CHƯA ĐẠT'} ({evalInfo.label})
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2 font-medium">
              Đúng: <strong className="text-emerald-400">{result.correctCount}</strong> / Sai: <strong className="text-rose-400">{result.incorrectCount}</strong> / Bỏ qua: <strong className="text-slate-400">{result.skippedCount}</strong>
            </p>
          </div>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {result.skippedCount > 0 && onContinueIncompleteExam && (
              <button
                onClick={onContinueIncompleteExam}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all hover:scale-102 ring-2 ring-amber-400/50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Tiếp Tục Hoàn Thành ({result.skippedCount} câu chưa làm)</span>
              </button>
            )}

            {wrongQuestions.length > 0 && (
              <button
                onClick={() => onPracticeMistakes(wrongQuestions)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Luyện Tập Lại {wrongQuestions.length} Câu Sai</span>
              </button>
            )}

            <button
              onClick={onStartNewExam}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Theo Chuẩn Đầu Ra (CĐR)
            </h3>
            <span className="text-xs text-slate-500 font-medium">Học phần SQA</span>
          </div>

          <div className="space-y-4">
            {Object.entries(result.breakdownByCdr).map(([cdr, stat]) => (
              <div key={cdr} className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-800">
                    {cdr} ({cdr === 'CĐR 1.1' ? 'Lý thuyết & Kỹ thuật' : 'Thực hành & Công cụ'})
                  </span>
                  <span className="font-bold text-indigo-700">
                    {stat.correct}/{stat.total} câu ({stat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.percentage >= 70
                        ? 'bg-emerald-500'
                        : stat.percentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown by Difficulty */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Theo Mức Độ Khó
            </h3>
            <span className="text-xs text-slate-500 font-medium">Dễ / TB / Khó</span>
          </div>

          <div className="space-y-4">
            {(['DỄ', 'TRUNG BÌNH', 'KHÓ'] as const).map(diff => {
              const stat = result.breakdownByDifficulty[diff] || { total: 0, correct: 0, percentage: 0 };
              if (stat.total === 0) return null;
              return (
                <div key={diff} className="space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          diff === 'DỄ'
                            ? 'bg-emerald-500'
                            : diff === 'TRUNG BÌNH'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      Mức độ {diff}
                    </span>
                    <span className="font-bold text-slate-700">
                      {stat.correct}/{stat.total} câu ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.percentage >= 70
                          ? 'bg-emerald-500'
                          : stat.percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
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
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Chi Tiết Từng Câu Hỏi & Đáp Án
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Xem lại các câu bạn đã làm đúng, sai hoặc bỏ qua kèm đáp án chuẩn từ ngân hàng
            </p>
          </div>

          {/* Search inside review */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo từ khóa, mã câu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({result.totalQuestions})
          </button>

          <button
            onClick={() => setFilter('wrong')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === 'wrong'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Câu làm sai ({result.incorrectCount})</span>
          </button>

          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === 'correct'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Câu đúng ({result.correctCount})</span>
          </button>

          {result.skippedCount > 0 && (
            <button
              onClick={() => setFilter('skipped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'skipped'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Chưa làm ({result.skippedCount})
            </button>
          )}

          <button
            onClick={() => setFilter('flagged')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === 'flagged'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
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
                  className={`p-5 rounded-2xl border transition-all ${
                    item.isCorrect
                      ? 'border-emerald-200 bg-white'
                      : item.isSkipped
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-rose-200 bg-white'
                  }`}
                >
                  {/* Question Tag Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${
                          item.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.isSkipped
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.isCorrect ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Đúng
                          </>
                        ) : item.isSkipped ? (
                          <>Chưa làm</>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Sai
                          </>
                        )}
                      </span>

                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        #{q.code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        {q.cdr}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        • {q.groupName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title="Đánh dấu câu hỏi này"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm sm:text-base font-semibold text-slate-900 mb-4 leading-relaxed">
                    <FormattedQuestionText text={q.question} />
                  </div>

                  {/* Diagram if present */}
                  {q.diagramUrl && (
                    <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-md">
                      <img
                        src={q.diagramUrl}
                        alt="Sơ đồ câu hỏi"
                        className="max-h-60 w-auto mx-auto rounded-lg object-contain bg-white border border-slate-200"
                      />
                    </div>
                  )}

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    {q.options.map(opt => {
                      const isCorrect = opt.id === q.correctOption;
                      const isUserChoice = item.userAnswer === opt.id;

                      let style = 'border-slate-200 bg-slate-50/50 text-slate-700';

                      if (isCorrect) {
                        style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                      } else if (isUserChoice && !isCorrect) {
                        style = 'border-rose-400 bg-rose-50 text-rose-950 line-through ring-1 ring-rose-400';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 ${style}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : isUserChoice
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="pt-0.5 leading-snug">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation / Notes */}
                  <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800">Đáp án chính xác: </span>
                    <strong className="text-emerald-700 font-bold">
                      {String.fromCharCode(64 + q.correctOption)}. {q.options.find(o => o.id === q.correctOption)?.text}
                    </strong>
                    {item.userAnswer !== null && !item.isCorrect && (
                      <span className="block text-rose-600 mt-0.5">
                        (Bạn đã chọn: {String.fromCharCode(64 + item.userAnswer)})
                      </span>
                    )}
                    <span className="block text-slate-500 mt-1">
                      Chuyên đề: <em>{q.topic}</em> • Chuẩn đầu ra: <em>{q.cdr}</em>.
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Next-Step Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 text-center space-y-5">
        <h3 className="text-xl sm:text-2xl font-bold">
          Bạn Đã Xem Xong Kết Quả! Tiếp Theo Bạn Muốn Làm Gì?
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
          Bạn có thể làm ngay một đề thi 50 câu mới, tiếp tục giải nốt các câu chưa làm, hoặc ôn luyện riêng các câu đã làm sai để ghi nhớ kiến thức.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {result.skippedCount > 0 && onContinueIncompleteExam && (
            <button
              onClick={onContinueIncompleteExam}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-102"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Tiếp Tục Hoàn Thành ({result.skippedCount} câu chưa làm)</span>
            </button>
          )}

          {wrongQuestions.length > 0 && (
            <button
              onClick={() => onPracticeMistakes(wrongQuestions)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all hover:scale-102"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Luyện Tập Lại {wrongQuestions.length} Câu Sai</span>
            </button>
          )}

          <button
            onClick={onStartNewExam}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4" />
            <span>Làm Đề Thi Mới (50 câu khác)</span>
          </button>

          <button
            onClick={onRetakeSameExam}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm Lại Đề Này Từ Đầu</span>
          </button>

          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-semibold text-sm border border-white/10 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
