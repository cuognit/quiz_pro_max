import React from 'react';
import {
  FileText,
  Sliders,
  AlertCircle,
  History,
  BookOpen,
  Award,
  Sparkles,
  Bookmark
} from 'lucide-react';

export type TabType = 'exam' | 'practice' | 'mistakes' | 'history' | 'bank' | 'bookmarks';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  mistakesCount: number;
  bookmarksCount: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  mistakesCount,
  bookmarksCount,
  historyCount
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:py-0 sm:h-16 gap-2">
          {/* Logo & App title */}
          <div
            onClick={() => onSelectTab('exam')}
            className="flex items-center justify-between cursor-pointer select-none group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
                  SQA Quiz Pro
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  300 Câu SQA
                </span>
              </div>
            </div>

            {/* Mobile bookmarks quick pill */}
            {bookmarksCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('bookmarks');
                }}
                className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200"
              >
                <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{bookmarksCount}</span>
              </button>
            )}
          </div>

          {/* Navigation Links - Scrollable on mobile */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
            <button
              onClick={() => onSelectTab('exam')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'exam'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Thi Trắc Nghiệm</span>
            </button>

            <button
              onClick={() => onSelectTab('practice')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'practice'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Luyện Tập</span>
            </button>

            <button
              onClick={() => onSelectTab('mistakes')}
              className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'mistakes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span>Câu Làm Sai</span>
              {mistakesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'mistakes'
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {mistakesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Lịch Sử</span>
              {historyCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'history'
                      ? 'bg-indigo-200 text-indigo-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('bank')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'bank'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Ngân Hàng 300 Câu</span>
            </button>

            {bookmarksCount > 0 && (
              <button
                onClick={() => onSelectTab('bookmarks')}
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
                title="Câu hỏi đã đánh dấu"
              >
                <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{bookmarksCount}</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
