import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  EyeOff,
  Bookmark,
  Play,
  CheckCircle2,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';
import { Question } from '../types/quiz';
import { toggleBookmarkStorage, getBookmarks } from '../utils/storage';
import { FormattedQuestionText } from './FormattedQuestionText';

interface QuestionBankBrowserProps {
  questions: Question[];
  onPracticeFiltered: (questionsToPractice: Question[]) => void;
  filterBookmarksOnly?: boolean;
}

export const QuestionBankBrowser: React.FC<QuestionBankBrowserProps> = ({
  questions,
  onPracticeFiltered,
  filterBookmarksOnly = false
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCdr, setSelectedCdr] = useState<string>('all');
  const [showOnlyDiagrams, setShowOnlyDiagrams] = useState<boolean>(false);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(filterBookmarksOnly);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [hideAllAnswers, setHideAllAnswers] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarks());

  useEffect(() => {
    if (filterBookmarksOnly) {
      setShowOnlyBookmarks(true);
    }
  }, [filterBookmarksOnly]);

  const handleToggleBookmark = (qId: string) => {
    toggleBookmarkStorage(qId);
    setBookmarkedIds(getBookmarks());
  };

  const handleToggleReveal = (qId: string) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleToggleAllAnswers = () => {
    if (hideAllAnswers) {
      setHideAllAnswers(false);
      setRevealedAnswers({});
    } else {
      setHideAllAnswers(true);
      const all: Record<string, boolean> = {};
      questions.forEach(q => (all[q.id] = false));
      setRevealedAnswers(all);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (selectedGroup !== 'all' && q.group !== selectedGroup) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedCdr !== 'all' && q.cdr !== selectedCdr) return false;
    if (showOnlyDiagrams && !q.diagramUrl) return false;
    if (showOnlyBookmarks && !bookmarkedIds.includes(q.id)) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const text = (q.question + ' ' + q.code + ' ' + q.topic + ' ' + q.groupName).toLowerCase();
      return text.includes(query);
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f1fc] dark:bg-[#152230] text-[#4f80b9] dark:text-[#7da7d9] flex items-center justify-center border border-[#d0e4f7] dark:border-[#2e4359]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#152230] dark:text-[#f4f8fd]">
              Ngân Hàng 300 Câu Hỏi SQA
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#a6c5e8] mt-1">
            Tra cứu và học tập toàn bộ ngân hàng câu hỏi môn Đánh giá và kiểm định chất lượng phần mềm
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToggleAllAnswers}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-[#2e4359] bg-white dark:bg-[#1c2c3d] hover:bg-[#f4f8fd] dark:hover:bg-[#233446] text-slate-700 dark:text-[#dceeff] transition-colors shadow-xs"
          >
            {hideAllAnswers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hideAllAnswers ? 'Hiện đáp án tất cả' : 'Chế độ Flashcard (Ẩn đáp án)'}</span>
          </button>

          {filteredQuestions.length > 0 && (
            <button
              onClick={() => onPracticeFiltered(filteredQuestions)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#4f80b9] hover:bg-[#4372a7] transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Luyện {filteredQuestions.length} câu này</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-3xl bg-white dark:bg-[#1c2c3d] p-4 sm:p-6 border border-[#dceeff] dark:border-[#2e4359] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo từ khóa, mã câu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f80b9] text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f80b9]"
          >
            <option value="all">Tất cả nhóm (1 - 6)</option>
            <option value="1">Group 1: Dễ - CĐR 1.1 (49 câu)</option>
            <option value="2">Group 2: TB - CĐR 1.1 (97 câu)</option>
            <option value="3">Group 3: Khó - CĐR 1.1 (19 câu)</option>
            <option value="4">Group 4: Dễ - CĐR 2.1 (20 câu)</option>
            <option value="5">Group 5: TB - CĐR 2.1 (74 câu)</option>
            <option value="6">Group 6: Khó - CĐR 2.1 (40 câu)</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f80b9]"
          >
            <option value="all">Tất cả mức độ khó</option>
            <option value="DỄ">Dễ (69 câu)</option>
            <option value="TRUNG BÌNH">Trung bình (171 câu)</option>
            <option value="KHÓ">Khó (59 câu)</option>
          </select>

          {/* CDR Filter */}
          <select
            value={selectedCdr}
            onChange={e => setSelectedCdr(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f80b9]"
          >
            <option value="all">Tất cả Chuẩn đầu ra</option>
            <option value="CĐR 1.1">CĐR 1.1: Lý thuyết & Kỹ thuật</option>
            <option value="CĐR 2.1">CĐR 2.1: Công cụ & Luồng dữ liệu</option>
          </select>
        </div>

        {/* Checkbox pills */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <input
              type="checkbox"
              checked={showOnlyDiagrams}
              onChange={e => setShowOnlyDiagrams(e.target.checked)}
              className="w-4 h-4 rounded accent-[#4f80b9]"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Chỉ xem câu có sơ đồ / đồ thị CFG
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <input
              type="checkbox"
              checked={showOnlyBookmarks}
              onChange={e => setShowOnlyBookmarks(e.target.checked)}
              className="w-4 h-4 rounded accent-[#4f80b9]"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Chỉ xem câu đã đánh dấu ({bookmarkedIds.length})
            </span>
          </label>

          <span className="text-slate-400 ml-auto font-medium">
            Hiển thị <strong>{filteredQuestions.length}</strong> / {questions.length} câu
          </span>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Không tìm thấy câu hỏi nào phù hợp với điều kiện tìm kiếm.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isBookmarked = bookmarkedIds.includes(q.id);
            const isRevealed = hideAllAnswers ? revealedAnswers[q.id] === true : true;

            return (
              <div
                key={q.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#2e4359] shadow-sm space-y-4 transition-all hover:border-[#4f80b9] dark:hover:border-[#7da7d9]"
              >
                {/* Meta bar */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#e6f1fc] dark:bg-[#152230] text-[#4f80b9] dark:text-[#7da7d9] border border-[#d0e4f7] dark:border-[#2e4359]">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Mã: {q.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {q.cdr}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        q.difficulty === 'DỄ'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : q.difficulty === 'TRUNG BÌNH'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border border-[#f5c6cb] dark:border-[#522b34]'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                      • {q.groupName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        isBookmarked
                          ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                      title="Đánh dấu câu hỏi này"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  <FormattedQuestionText text={q.question} />
                </div>

                {/* Diagram if available */}
                {q.diagramUrl && (
                  <div className="my-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-md">
                    <img
                      src={q.diagramUrl}
                      alt="Sơ đồ câu hỏi"
                      className="max-h-64 w-auto mx-auto rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                  {q.options.map(opt => {
                    const isCorrect = opt.id === q.correctOption;
                    let style = 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';

                    if (isRevealed && isCorrect) {
                      style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-2xl border flex items-start gap-2.5 ${style}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isRevealed && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="pt-0.5 leading-snug">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Answer reveal bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                  {hideAllAnswers && (
                    <button
                      onClick={() => handleToggleReveal(q.id)}
                      className="text-xs text-[#4f80b9] dark:text-[#7da7d9] hover:underline font-semibold flex items-center gap-1"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Ẩn đáp án' : 'Bấm để xem đáp án đúng'}</span>
                    </button>
                  )}

                  {isRevealed && (
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Đáp án đúng: {String.fromCharCode(64 + q.correctOption)}.
                      </span>{' '}
                      <span className="text-slate-400">({q.topic})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
