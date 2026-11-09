import React, { useState } from 'react';
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
}

export const QuestionBankBrowser: React.FC<QuestionBankBrowserProps> = ({
  questions,
  onPracticeFiltered
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCdr, setSelectedCdr] = useState<string>('all');
  const [showOnlyDiagrams, setShowOnlyDiagrams] = useState<boolean>(false);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [hideAllAnswers, setHideAllAnswers] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarks());

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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Ngân Hàng 300 Câu Hỏi SQA
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu và học tập toàn bộ ngân hàng câu hỏi môn Đánh giá và kiểm định chất lượng phần mềm
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToggleAllAnswers}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            {hideAllAnswers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hideAllAnswers ? 'Hiện đáp án tất cả' : 'Chế độ Flashcard (Ẩn đáp án)'}</span>
          </button>

          {filteredQuestions.length > 0 && (
            <button
              onClick={() => onPracticeFiltered(filteredQuestions)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Luyện {filteredQuestions.length} câu này</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo từ khóa, mã câu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Tất cả Chuẩn đầu ra</option>
            <option value="CĐR 1.1">CĐR 1.1: Lý thuyết & Kỹ thuật</option>
            <option value="CĐR 2.1">CĐR 2.1: Công cụ & Luồng dữ liệu</option>
          </select>
        </div>

        {/* Checkbox pills */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showOnlyDiagrams}
              onChange={e => setShowOnlyDiagrams(e.target.checked)}
              className="w-3.5 h-3.5 rounded-sm text-indigo-600 accent-indigo-600"
            />
            <span className="flex items-center gap-1 font-medium">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              Chỉ xem câu có sơ đồ / đồ thị CFG
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showOnlyBookmarks}
              onChange={e => setShowOnlyBookmarks(e.target.checked)}
              className="w-3.5 h-3.5 rounded-sm text-indigo-600 accent-indigo-600"
            />
            <span className="flex items-center gap-1 font-medium">
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
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <p className="text-sm text-slate-500">
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
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 transition-all hover:border-slate-300"
              >
                {/* Meta bar */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Mã: {q.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      {q.cdr}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        q.difficulty === 'DỄ'
                          ? 'bg-emerald-50 text-emerald-700'
                          : q.difficulty === 'TRUNG BÌNH'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
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

                {/* Question Statement */}
                <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  <FormattedQuestionText text={q.question} />
                </div>

                {/* Diagram if available */}
                {q.diagramUrl && (
                  <div className="my-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-md">
                    <img
                      src={q.diagramUrl}
                      alt="Sơ đồ câu hỏi"
                      className="max-h-64 w-auto mx-auto rounded-lg object-contain bg-white border border-slate-200"
                    />
                  </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {q.options.map(opt => {
                    const isCorrect = opt.id === q.correctOption;
                    let style = 'border-slate-200 bg-slate-50/50 text-slate-700';

                    if (isRevealed && isCorrect) {
                      style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 ${style}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                            isRevealed && isCorrect
                              ? 'bg-emerald-600 text-white'
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

                {/* Answer reveal bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  {hideAllAnswers && (
                    <button
                      onClick={() => handleToggleReveal(q.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Ẩn đáp án' : 'Bấm để xem đáp án đúng'}</span>
                    </button>
                  )}

                  {isRevealed && (
                    <div className="text-slate-700">
                      <span className="font-bold text-emerald-700">
                        Đáp án đúng: {String.fromCharCode(64 + q.correctOption)}.
                      </span>{' '}
                      <span className="text-slate-500">({q.topic})</span>
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
