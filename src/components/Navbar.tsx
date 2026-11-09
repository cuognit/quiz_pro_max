import React, { useState } from 'react';
import {
  FileText,
  AlertCircle,
  History,
  BookOpen,
  Bookmark,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Sparkles,
  Award
} from 'lucide-react';
import { ThemeMode } from '../utils/theme';

export type TabType = 'exam' | 'mistakes' | 'history' | 'bank';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  mistakesCount: number;
  bookmarksCount: number;
  historyCount: number;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenBookmarks?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  mistakesCount,
  bookmarksCount,
  historyCount,
  theme,
  onThemeChange,
  onOpenBookmarks
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === 'light') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('system');
    else onThemeChange('light');
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'exam',
      label: 'Trang Chủ & Đề Thi',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'mistakes',
      label: 'Sổ Lỗi Sai',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: mistakesCount,
      badgeColor: 'bg-[#233446] text-[#fff7cc] dark:bg-[#fff7cc] dark:text-[#152230]'
    },
    {
      id: 'history',
      label: 'Lịch Sử & Tiến Trình',
      icon: <History className="w-4 h-4" />,
      badge: historyCount,
      badgeColor: 'bg-[#dceeff] text-[#233446] dark:bg-[#293d52] dark:text-[#dceeff]'
    },
    {
      id: 'bank',
      label: 'Ngân Hàng 300 Câu',
      icon: <BookOpen className="w-4 h-4" />,
      badge: bookmarksCount,
      badgeColor: 'bg-[#fff7cc] text-[#713f12] dark:bg-[#fff7cc]/20 dark:text-[#fff7cc]'
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#dceeff] dark:border-[#293d52] bg-white/90 dark:bg-[#152230]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('exam')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#233446] via-[#355271] to-[#4f80b9] flex items-center justify-center text-[#fff7cc] shadow-sm shadow-[#233446]/20 group-hover:scale-105 transition-all duration-200 border border-[#dceeff]/30">
              <Award className="w-5 h-5 fill-[#fff7cc]/20" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#1a2837] dark:text-[#f0f6fc] group-hover:text-[#4f80b9] dark:group-hover:text-[#7da7d9] transition-colors">
                  SQA Quiz Pro
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff7cc] text-[#713f12] border border-[#fde047]/60 dark:bg-[#fff7cc]/15 dark:text-[#fff7cc] dark:border-[#fff7cc]/30 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#ca8a04] dark:text-[#fde047]" />
                  Ice & Butter
                </span>
              </div>
              <span className="text-[11px] text-[#4f80b9] dark:text-[#7da7d9] hidden sm:block font-medium">
                Kiểm định & Đảm bảo chất lượng phần mềm
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#4f80b9] text-white shadow-xs font-semibold'
                      : 'text-[#233446] dark:text-[#dceeff] hover:text-[#152230] dark:hover:text-white hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                        isActive ? 'bg-white/25 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {bookmarksCount > 0 && (
              <button
                onClick={() => {
                  onSelectTab('bank');
                  if (onOpenBookmarks) onOpenBookmarks();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#713f12] dark:text-[#fff7cc] bg-[#fff7cc] dark:bg-[#fff7cc]/15 border border-[#fde047] dark:border-[#fff7cc]/30 hover:brightness-95 transition-all shadow-2xs"
                title="Xem các câu đã đánh dấu trong Ngân hàng"
              >
                <Bookmark className="w-3.5 h-3.5 fill-[#eab308] text-[#ca8a04]" />
                <span>{bookmarksCount}</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              className="flex items-center gap-1.5 p-2 rounded-xl text-[#233446] dark:text-[#dceeff] hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#293d52] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4f80b9]"
              title={`Giao diện: ${
                theme === 'light' ? 'Chế độ Sáng (Ice)' : theme === 'dark' ? 'Chế độ Tối (Navy)' : 'Theo Hệ Thống'
              } (Nhấp để đổi)`}
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-[#eab308] animate-in fade-in zoom-in duration-200" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-[#7da7d9] animate-in fade-in zoom-in duration-200" />}
              {theme === 'system' && <Monitor className="w-4 h-4 text-[#4f80b9] animate-in fade-in zoom-in duration-200" />}
              <span className="text-xs font-bold hidden sm:inline-block capitalize">
                {theme === 'light' ? 'Ice' : theme === 'dark' ? 'Navy' : 'Auto'}
              </span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#233446] dark:text-[#dceeff] hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Tab Scroll */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-[#dceeff] dark:border-[#293d52] scrollbar-none -mx-4 px-4">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#4f80b9] text-white shadow-xs font-bold'
                    : 'text-[#233446] dark:text-[#dceeff] hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Panel when expanded */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#dceeff] dark:border-[#293d52] space-y-1 animate-in slide-in-from-top-2 duration-200">
            <div className="px-2 py-1 text-xs font-bold text-[#4f80b9] dark:text-[#7da7d9] uppercase tracking-wider">
              Chọn chủ đề hiển thị
            </div>
            <div className="grid grid-cols-3 gap-2 p-1">
              <button
                onClick={() => onThemeChange('light')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border ${
                  theme === 'light'
                    ? 'bg-[#dceeff] border-[#4f80b9] text-[#233446]'
                    : 'border-[#dceeff] dark:border-[#293d52] text-[#233446] dark:text-[#dceeff]'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-[#eab308]" />
                <span>Ice Light</span>
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border ${
                  theme === 'dark'
                    ? 'bg-[#1c2c3d] border-[#7da7d9] text-[#fff7cc]'
                    : 'border-[#dceeff] dark:border-[#293d52] text-[#233446] dark:text-[#dceeff]'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#7da7d9]" />
                <span>Deep Navy</span>
              </button>
              <button
                onClick={() => onThemeChange('system')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border ${
                  theme === 'system'
                    ? 'bg-[#dceeff] border-[#4f80b9] text-[#233446]'
                    : 'border-[#dceeff] dark:border-[#293d52] text-[#233446] dark:text-[#dceeff]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-[#4f80b9]" />
                <span>Tự động</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
