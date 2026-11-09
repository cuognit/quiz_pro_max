import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  AlertCircle,
  History,
  BookOpen,
  Sun,
  Moon,
  Menu,
  X,
  Award,
  Check,
  ChevronDown,
  Palette,
  Sliders,
  RotateCcw
} from 'lucide-react';
import {
  ThemeMode,
  CustomPalette,
  PALETTE_COLORS,
  DEFAULT_CUSTOM_PALETTE,
  getCustomPalette,
  saveCustomPalette
} from '../utils/theme';

export type TabType = 'exam' | 'mistakes' | 'history' | 'bank';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  mistakesCount: number;
  historyCount: number;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode, customPalette?: CustomPalette) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  mistakesCount,
  historyCount,
  theme,
  onThemeChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [showMixer, setShowMixer] = useState(true);
  const [customPalette, setCustomPalette] = useState<CustomPalette>(getCustomPalette);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    if (themeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [themeDropdownOpen]);

  const handleSelectColor = (key: keyof CustomPalette, hex: string) => {
    const next: CustomPalette = { ...customPalette, [key]: hex };
    setCustomPalette(next);
    saveCustomPalette(next);
    onThemeChange('custom', next);
  };

  const handleReset = () => {
    setCustomPalette(DEFAULT_CUSTOM_PALETTE);
    saveCustomPalette(DEFAULT_CUSTOM_PALETTE);
    onThemeChange('custom', DEFAULT_CUSTOM_PALETTE);
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'exam',
      label: 'Luyện Đề Chuẩn',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'bank',
      label: 'Ngân Hàng Câu Hỏi',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'mistakes',
      label: 'Ôn Câu Làm Sai',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: mistakesCount,
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
    },
    {
      id: 'history',
      label: 'Lịch Sử Làm Bài',
      icon: <History className="w-4 h-4" />,
      badge: historyCount,
      badgeColor: 'bg-[#4f80b9]/15 text-[#4f80b9] dark:text-[#7da7d9] border border-[#4f80b9]/30'
    }
  ];

  const paletteSlots: { key: keyof CustomPalette; label: string; iconDesc: string }[] = [
    { key: 'canvas', label: '1. Nền trang (Canvas)', iconDesc: 'Nền không gian chính của toàn trang' },
    { key: 'card', label: '2. Mặt thẻ câu hỏi (Card)', iconDesc: 'Nền các khung câu hỏi và bảng thống kê' },
    { key: 'header', label: '3. Header & Footer', iconDesc: 'Nền thanh điều hướng và chân trang' },
    { key: 'button', label: '4. Nút bấm chính (Button)', iconDesc: 'Nút nộp bài, bắt đầu, và chỉ mục câu đang chọn' },
    { key: 'border', label: '5. Khung viền & Bảng', iconDesc: 'Đường viền các thẻ và phân chia ô bảng' },
    { key: 'text', label: '6. Màu chữ chính (Text)', iconDesc: 'Màu sắc tiêu đề và nội dung câu hỏi' },
    { key: 'hover', label: '7. Màu rê chuột (Hover)', iconDesc: 'Màu nền khi di chuột qua nút và dòng bảng' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#152230]/90 backdrop-blur-md border-b border-[#dceeff] dark:border-[#293d52] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('exam')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f80b9] to-[#2e5682] flex items-center justify-center text-white shadow-md shadow-[#4f80b9]/25 group-hover:scale-105 transition-transform duration-200">
              <Award className="w-5 h-5 text-[#fff7cc]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-[#152230] dark:text-[#f4f8fd] group-hover:text-[#4f80b9] transition-colors">
                  SQA Master Pro
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff7cc] text-[#152230] border border-[#fef08a] uppercase tracking-wider hidden sm:inline-block">
                  KTPM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Hệ thống ôn luyện Đảm bảo Chất lượng Phần mềm
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-[#f4f8fd] dark:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#293d52]">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-[#233446] dark:text-[#dceeff] hover:text-[#152230] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#152230]/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-[#4f80b9] rounded-xl shadow-xs"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Theme Selector */}
          <div className="flex items-center gap-2">
            {/* Theme Dropdown Trigger & Popover */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[#233446] dark:text-[#dceeff] hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#293d52] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4f80b9]"
                title="Bấm để chọn giao diện (Sáng, Tối hoặc Tự Phối Màu)"
              >
                {theme === 'ice' && (
                  <Sun className="w-4 h-4 text-[#4f80b9]" />
                )}
                {theme === 'dark' && (
                  <Moon className="w-4 h-4 text-[#7da7d9]" />
                )}
                {theme === 'custom' && (
                  <Sliders className="w-4 h-4 text-[#2563eb]" />
                )}
                <span className="text-xs font-bold hidden sm:inline-block">
                  {theme === 'ice'
                    ? 'Sáng (Ice Light)'
                    : theme === 'dark'
                    ? 'Tối (Deep Navy)'
                    : 'Tự Phối Màu'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${themeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Theme Dropdown Popover */}
              <AnimatePresence>
                {themeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-84 sm:w-96 rounded-2xl bg-white dark:bg-[#1c2c3d] p-3.5 shadow-2xl border border-[#dceeff] dark:border-[#2e4359] z-50 space-y-2.5 max-h-[85vh] overflow-y-auto"
                  >
                    <div className="px-1 py-0.5 flex items-center justify-between border-b border-[#dceeff] dark:border-[#2e4359] pb-2">
                      <div>
                        <span className="text-xs font-bold text-[#152230] dark:text-[#f4f8fd] block">
                          Giao diện Ice & Butter
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          2 theme chuẩn + Bộ phối 5 màu tự do
                        </span>
                      </div>
                      <div className="flex -space-x-1">
                        {PALETTE_COLORS.map(c => (
                          <span
                            key={c.id}
                            className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Section 1: 2 Standard Themes */}
                    <div className="space-y-1.5">
                      {/* 1. Ice Light */}
                      <button
                        onClick={() => {
                          onThemeChange('ice');
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                          theme === 'ice'
                            ? 'bg-[#e6f1fc] text-[#4f80b9] font-bold ring-2 ring-[#4f80b9]'
                            : 'hover:bg-slate-50 dark:hover:bg-[#152230] text-[#152230] dark:text-[#f4f8fd]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#f4f8fd] border border-[#dceeff] flex items-center justify-center text-[#4f80b9] shrink-0">
                            <Sun className="w-3.5 h-3.5 text-[#4f80b9]" />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold">Sáng (Ice Light)</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-400">Nền xanh đá dịu mát, thẻ trắng</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            <span className="w-3 h-3 rounded-full bg-[#f4f8fd] border border-slate-300" />
                            <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                            <span className="w-3 h-3 rounded-full bg-[#4f80b9] border border-white" />
                          </div>
                          {theme === 'ice' && <Check className="w-4 h-4 text-[#4f80b9]" />}
                        </div>
                      </button>

                      {/* 2. Deep Navy */}
                      <button
                        onClick={() => {
                          onThemeChange('dark');
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                          theme === 'dark'
                            ? 'bg-[#152230] text-[#7da7d9] font-bold ring-2 ring-[#7da7d9]'
                            : 'hover:bg-slate-50 dark:hover:bg-[#152230] text-[#152230] dark:text-[#f4f8fd]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#152230] border border-[#2e4359] flex items-center justify-center text-[#7da7d9] shrink-0">
                            <Moon className="w-3.5 h-3.5 text-[#7da7d9]" />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold">Tối (Deep Navy)</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-400">Nền xanh đêm, tương phản cao</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            <span className="w-3 h-3 rounded-full bg-[#152230] border border-[#2e4359]" />
                            <span className="w-3 h-3 rounded-full bg-[#1c2c3d] border border-[#2e4359]" />
                            <span className="w-3 h-3 rounded-full bg-[#7da7d9] border border-[#2e4359]" />
                          </div>
                          {theme === 'dark' && <Check className="w-4 h-4 text-[#7da7d9]" />}
                        </div>
                      </button>
                    </div>

                    {/* Section 2: Palette Studio (Tự Phối Màu) */}
                    <div className="pt-2 border-t border-[#dceeff] dark:border-[#2e4359] space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <button
                          onClick={() => {
                            if (theme !== 'custom') {
                              onThemeChange('custom', customPalette);
                            }
                            setShowMixer(!showMixer);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#152230] dark:text-[#f4f8fd] hover:text-[#4f80b9] transition-colors"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[#4f80b9]" />
                          <span>Tự Phối Màu (Palette Studio)</span>
                          {theme === 'custom' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#4f80b9] text-white font-extrabold">
                              Đang áp dụng
                            </span>
                          )}
                        </button>
                        <button
                          onClick={handleReset}
                          className="text-[10px] text-slate-400 hover:text-[#4f80b9] flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#152230] transition-colors"
                          title="Đặt lại tổ hợp mặc định"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Đặt lại</span>
                        </button>
                      </div>

                      {showMixer && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#152230] border border-[#dceeff] dark:border-[#2e4359] space-y-2.5">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            Nhấp chọn màu bất kỳ cho từng thành phần (cập nhật trực tiếp):
                          </p>

                          {paletteSlots.map(slot => (
                            <div key={slot.key} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-[#152230] dark:text-[#f4f8fd]">
                                <span>{slot.label}</span>
                                <span
                                  className="w-3 h-3 rounded-full border border-black/20"
                                  style={{ backgroundColor: customPalette[slot.key] }}
                                />
                              </div>
                              <div className="grid grid-cols-5 gap-1.5">
                                {PALETTE_COLORS.map(c => {
                                  const isSelected = customPalette[slot.key].toUpperCase() === c.hex.toUpperCase();
                                  return (
                                    <button
                                      key={c.id}
                                      onClick={() => handleSelectColor(slot.key, c.hex)}
                                      className={`h-6 rounded-md transition-all flex items-center justify-center border ${
                                        isSelected
                                          ? 'ring-2 ring-[#4f80b9] scale-105 shadow-xs border-[#4f80b9]'
                                          : 'border-slate-300 dark:border-slate-600 opacity-80 hover:opacity-100 hover:scale-102'
                                      }`}
                                      style={{ backgroundColor: c.hex }}
                                      title={`${slot.label}: ${c.name} (${c.hex})`}
                                    >
                                      {isSelected && (
                                        <Check
                                          className={`w-3 h-3 ${
                                            c.isDark ? 'text-white' : 'text-[#2F4860]'
                                          }`}
                                        />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#233446] dark:text-[#dceeff] hover:bg-[#dceeff]/50 dark:hover:bg-[#1c2c3d]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMobileNavPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-[#4f80b9] rounded-lg shadow-xs"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
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
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Panel when expanded */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#dceeff] dark:border-[#293d52] space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="px-2 py-1 text-xs font-bold text-[#4f80b9] dark:text-[#7da7d9] uppercase tracking-wider flex items-center justify-between">
              <span>Bảng màu giao diện</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1">
              <button
                onClick={() => {
                  onThemeChange('ice');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold border ${
                  theme === 'ice'
                    ? 'bg-[#dceeff] border-[#4f80b9] text-[#233446]'
                    : 'border-[#dceeff] dark:border-[#293d52] text-[#233446] dark:text-[#dceeff]'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-[#4f80b9]" />
                <span>Sáng</span>
              </button>
              <button
                onClick={() => {
                  onThemeChange('dark');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold border ${
                  theme === 'dark'
                    ? 'bg-[#1c2c3d] border-[#7da7d9] text-[#fff7cc]'
                    : 'border-[#dceeff] dark:border-[#293d52] text-[#233446] dark:text-[#dceeff]'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#7da7d9]" />
                <span>Tối</span>
              </button>
              <button
                onClick={() => {
                  onThemeChange('custom', customPalette);
                  setMobileMenuOpen(false);
                  setThemeDropdownOpen(true);
                }}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold border ${
                  theme === 'custom'
                    ? 'bg-[#4f80b9] border-[#2e5682] text-white'
                    : 'border-[#dceeff] dark:border-[#293d52] text-[#233446] dark:text-[#dceeff]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Tự Phối</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
