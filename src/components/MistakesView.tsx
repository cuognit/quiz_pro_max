import React, { useState } from 'react';
import {
  AlertCircle,
  Play,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  Check,
  RotateCcw,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Question, MistakeRecord } from '../types/quiz';
import { resolveMistake, removeMistake, clearAllMistakes } from '../utils/storage';
import { FormattedQuestionText } from './FormattedQuestionText';

interface MistakesViewProps {
  questions: Question[];
  mistakes: Record<string, MistakeRecord>;
  onRefreshMistakes: () => void;
  onPracticeMistakes: (questionsToPractice: Question[]) => void;
  onGoToBank: () => void;
}

export const MistakesView: React.FC<MistakesViewProps> = ({
  questions,
  mistakes,
  onRefreshMistakes,
  onPracticeMistakes,
  onGoToBank
}) => {
  const [filterStatus, setFilterStatus] = useState<'unresolved' | 'resolved' | 'all'>('unresolved');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const questionMap = new Map<string, Question>();
  questions.forEach(q => questionMap.set(q.id, q));

  // Build mistake items
  const mistakeList = Object.values(mistakes)
    .map(m => {
      const q = questionMap.get(m.questionId);
      return q ? { record: m, question: q } : null;
    })
    .filter((item): item is { record: MistakeRecord; question: Question } => item !== null);

  const unresolvedCount = mistakeList.filter(m => !m.record.resolved).length;
  const resolvedCount = mistakeList.filter(m => m.record.resolved).length;

  const filteredItems = mistakeList.filter(item => {
    if (filterStatus === 'unresolved' && item.record.resolved) return false;
    if (filterStatus === 'resolved' && !item.record.resolved) return false;

    if (selectedGroup !== 'all' && item.question.group !== selectedGroup) return false;

    if (searchQuery.trim()) {
      const text = (item.question.question + ' ' + item.question.code + ' ' + item.question.topic).toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleToggleResolve = (qId: string) => {
    resolveMistake(qId);
    onRefreshMistakes();
  };

  const handleRemove = (qId: string) => {
    removeMistake(qId);
    onRefreshMistakes();
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách câu hỏi làm sai?')) {
      clearAllMistakes();
      onRefreshMistakes();
    }
  };

  const handlePracticeAllUnresolved = () => {
    const list = mistakeList.filter(m => !m.record.resolved).map(m => m.question);
    if (list.length > 0) {
      onPracticeMistakes(list);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#152230] via-[#1c2c3d] to-[#152230] text-white p-6 sm:p-8 border border-[#2e4359] shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#c25e5e]/20 text-[#f0a8a8] border border-[#c25e5e]/30 mb-3 backdrop-blur-md">
            <AlertCircle className="w-3.5 h-3.5 text-[#f0a8a8]" />
            Sổ Tay Ôn Luyện Lỗi Sai (Mistake Bank)
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Khắc Phục Lỗ Hổng Kiến Thức
          </h1>
          <p className="text-[#dceeff]/85 text-xs sm:text-sm leading-relaxed mb-6">
            Mỗi khi bạn làm sai một câu hỏi trong đề thi, câu hỏi đó sẽ được tự động lưu vào đây kèm số lần làm sai để bạn có thể tiếp tục luyện tập cho đến khi hoàn toàn hiểu rõ.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePracticeAllUnresolved}
              disabled={unresolvedCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c25e5e] hover:bg-[#b04f4f] active:bg-[#9a4242] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all hover:scale-102"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Luyện Tập Lại ({unresolvedCount} Câu Chưa Khắc Phục)</span>
            </button>

            {mistakeList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa toàn bộ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="rounded-3xl bg-white dark:bg-[#1c2c3d] p-4 sm:p-6 border border-[#dceeff] dark:border-[#2e4359] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus('unresolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'unresolved'
                ? 'bg-[#c25e5e] text-white'
                : 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] hover:bg-[#fbd5d8]'
            }`}
          >
            Chưa khắc phục ({unresolvedCount})
          </button>

          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            }`}
          >
            Đã khắc phục ({resolvedCount})
          </button>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-800 dark:bg-slate-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả ({mistakeList.length})
          </button>
        </div>

        {/* Group filter & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f80b9]"
          >
            <option value="all">Tất cả nhóm</option>
            <option value="1">Group 1 (Dễ - CĐR 1.1)</option>
            <option value="2">Group 2 (TB - CĐR 1.1)</option>
            <option value="3">Group 3 (Khó - CĐR 1.1)</option>
            <option value="4">Group 4 (Dễ - CĐR 2.1)</option>
            <option value="5">Group 5 (TB - CĐR 2.1)</option>
            <option value="6">Group 6 (Khó - CĐR 2.1)</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo từ khóa, mã câu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f80b9] text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Mistakes List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">
              Tuyệt Vời! Không Có Câu Hỏi Nào
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              {filterStatus === 'unresolved'
                ? 'Bạn đã khắc phục toàn bộ các câu hỏi làm sai hoặc chưa có câu sai nào trong hệ thống.'
                : 'Không có dữ liệu phù hợp với bộ lọc hiện tại.'}
            </p>
            <button
              onClick={onGoToBank}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#4f80b9] hover:bg-[#4372a7] text-white shadow-xs transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khám phá ngân hàng 300 câu</span>
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const q = item.question;
            const rec = item.record;
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-3xl border transition-all ${
                  rec.resolved
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      #{q.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {q.cdr}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        q.difficulty === 'DỄ'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : q.difficulty === 'TRUNG BÌNH'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border border-[#f5c6cb] dark:border-[#522b34]'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-[#b04848] dark:text-[#f0a8a8] font-bold bg-[#fdf2f4] dark:bg-[#351e24] px-2 py-0.5 rounded-md border border-[#f5c6cb] dark:border-[#522b34]">
                      Sai {rec.wrongCount} lần
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleResolve(q.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        rec.resolved
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300'
                      }`}
                      title={rec.resolved ? 'Đánh dấu là chưa khắc phục' : 'Đánh dấu là đã hiểu rõ'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{rec.resolved ? 'Đã khắc phục' : 'Đã hiểu'}</span>
                    </button>

                    <button
                      onClick={() => handleRemove(q.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-[#c25e5e] dark:hover:text-[#f0a8a8] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Xóa khỏi sổ lỗi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 mb-3 leading-relaxed">
                  <FormattedQuestionText text={q.question} />
                </div>

                {/* Quick toggle details */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#4f80b9] dark:text-[#7da7d9] hover:underline mb-2"
                >
                  <span>{isExpanded ? 'Ẩn các lựa chọn đáp án' : 'Xem các lựa chọn & đáp án đúng'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {q.options.map(option => {
                      const isCorrect = option.id === q.correctOption;
                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
                            isCorrect
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-medium'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="flex-1 pt-0.5">{option.text}</span>
                          {isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
