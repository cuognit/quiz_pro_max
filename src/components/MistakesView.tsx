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
  Sparkles
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-rose-900/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 mb-3 backdrop-blur-xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Sổ tay ôn luyện các câu làm sai (Mistake Bank)
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Khắc Phục Lỗ Hổng Kiến Thức
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Mỗi khi bạn làm sai một câu hỏi trong bất kỳ đề thi nào, câu hỏi đó sẽ được tự động lưu
            vào đây kèm số lần làm sai để bạn có thể tiếp tục luyện tập cho đến khi hiểu rõ.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePracticeAllUnresolved}
              disabled={unresolvedCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-rose-600/30 transition-all hover:scale-102"
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
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('unresolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'unresolved'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Chưa khắc phục ({unresolvedCount})
          </button>

          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Đã khắc phục ({resolvedCount})
          </button>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Tất cả nhóm</option>
            <option value="1">Group 1 (Dễ - CĐR 1.1)</option>
            <option value="2">Group 2 (TB - CĐR 1.1)</option>
            <option value="3">Group 3 (Khó - CĐR 1.1)</option>
            <option value="4">Group 4 (Dễ - CĐR 2.1)</option>
            <option value="5">Group 5 (TB - CĐR 2.1)</option>
            <option value="6">Group 6 (Khó - CĐR 2.1)</option>
          </select>

          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Mistake Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Không có câu hỏi làm sai nào trong danh mục này!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Hãy tiếp tục duy trì phong độ làm bài thi hoặc ôn tập các chuyên đề khác trong ngân hàng.
            </p>
            <button
              onClick={onGoToBank}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Xem Ngân Hàng 300 Câu</span>
            </button>
          </div>
        ) : (
          filteredItems.map(({ record, question: q }) => (
            <div
              key={q.id}
              className={`p-6 rounded-2xl bg-white border shadow-xs transition-all ${
                record.resolved ? 'border-slate-200 opacity-75' : 'border-rose-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                      record.resolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {record.resolved ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Đã khắc phục
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Sai {record.wrongCount} lần
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
                  <span className="text-xs text-slate-500">
                    • {q.groupName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleResolve(q.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                      record.resolved
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{record.resolved ? 'Đánh dấu chưa hiểu' : 'Đã hiểu câu này'}</span>
                  </button>

                  <button
                    onClick={() => handleRemove(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa khỏi danh sách câu sai"
                  >
                    <Trash2 className="w-4 h-4" />
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
                    className="max-h-56 w-auto mx-auto rounded-lg object-contain bg-white border border-slate-200"
                  />
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {q.options.map(opt => {
                  const isCorrect = opt.id === q.correctOption;
                  const isLastWrong = record.lastUserAnswer === opt.id && !isCorrect;

                  let style = 'border-slate-200 bg-slate-50/50 text-slate-700';
                  if (isCorrect) {
                    style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                  } else if (isLastWrong) {
                    style = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400';
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
                            : isLastWrong
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

              {/* Explanation Note */}
              <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-bold text-slate-800">Đáp án chính xác: </span>
                  <strong className="text-emerald-700 font-bold">
                    {String.fromCharCode(64 + q.correctOption)}. {q.options.find(o => o.id === q.correctOption)?.text}
                  </strong>
                </div>
                <button
                  onClick={() => onPracticeMistakes([q])}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Luyện lại câu này</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
