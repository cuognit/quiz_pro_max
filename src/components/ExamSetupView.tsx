import React, { useState, useRef } from 'react';
import {
  Play,
  Clock,
  HelpCircle,
  Layers,
  Sparkles,
  Zap,
  Flame,
  Target,
  Shuffle,
  Eye,
  Award,
  Check,
  BookOpen,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { ExamConfig, Question } from '../types/quiz';

interface ExamSetupViewProps {
  questions: Question[];
  onStartExam: (config: ExamConfig) => void;
  defaultMode?: 'standard' | 'custom' | 'practice';
}

export const ExamSetupView: React.FC<ExamSetupViewProps> = ({
  questions,
  onStartExam,
  defaultMode = 'standard'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'standard' | 'custom'>('standard');
  const customSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToCustom = () => {
    setActiveSubTab('custom');
    setTimeout(() => {
      customSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Custom configuration state
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<('DỄ' | 'TRUNG BÌNH' | 'KHÓ')[]>([
    'DỄ',
    'TRUNG BÌNH',
    'KHÓ'
  ]);
  const [selectedCdrs, setSelectedCdrs] = useState<('CĐR 1.1' | 'CĐR 2.1')[]>([
    'CĐR 1.1',
    'CĐR 2.1'
  ]);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [immediateFeedback, setImmediateFeedback] = useState<boolean>(false);

  // Group info stats
  const groupStats = [1, 2, 3, 4, 5, 6].map(g => {
    const list = questions.filter(q => q.group === g);
    const cdr = g <= 3 ? 'CĐR 1.1' : 'CĐR 2.1';
    const diff = g === 1 || g === 4 ? 'DỄ' : g === 2 || g === 5 ? 'TRUNG BÌNH' : 'KHÓ';
    return { group: g, count: list.length, cdr, diff };
  });

  const toggleGroup = (g: number) => {
    if (selectedGroups.includes(g)) {
      setSelectedGroups(selectedGroups.filter(item => item !== g));
    } else {
      setSelectedGroups([...selectedGroups, g]);
    }
  };

  const selectAllGroups = () => {
    setSelectedGroups([1, 2, 3, 4, 5, 6]);
  };

  const deselectAllGroups = () => {
    setSelectedGroups([]);
  };

  const handleStartStandard = () => {
    onStartExam({
      mode: 'standard',
      title: 'Đề Thi Chuẩn SQA (50 Câu - 60 Phút)',
      questionCount: 50,
      durationMinutes: 60,
      selectedGroups: [1, 2, 3, 4, 5, 6],
      selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
      selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
      shuffleQuestions: true,
      shuffleOptions: false,
      immediateFeedback: false
    });
  };

  const handleStartCustom = () => {
    const activeGroups = selectedGroups.length > 0 ? selectedGroups : [1, 2, 3, 4, 5, 6];
    onStartExam({
      mode: immediateFeedback ? 'practice' : 'custom',
      title: immediateFeedback
        ? `Luyện Tập SQA (${questionCount} câu - Xem kết quả ngay)`
        : `Thi Thử Tùy Chọn (${questionCount} câu - ${durationMinutes > 0 ? durationMinutes + ' phút' : 'Tự do'})`,
      questionCount,
      durationMinutes,
      selectedGroups: activeGroups,
      selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
      selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
      shuffleQuestions,
      shuffleOptions: false,
      immediateFeedback
    });
  };

  const launchPreset = (preset: {
    title: string;
    count: number;
    minutes: number;
    groups: number[];
    immediate: boolean;
  }) => {
    onStartExam({
      mode: preset.immediate ? 'practice' : 'custom',
      title: preset.title,
      questionCount: preset.count,
      durationMinutes: preset.minutes,
      selectedGroups: preset.groups,
      selectedCdrs: ['CĐR 1.1', 'CĐR 2.1'],
      selectedDifficulties: ['DỄ', 'TRUNG BÌNH', 'KHÓ'],
      shuffleQuestions: true,
      shuffleOptions: false,
      immediateFeedback: preset.immediate
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Modern Hero & Quick Action Dashboard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#152230] via-[#1c2c3d] to-[#152230] text-white p-6 sm:p-10 border border-[#2e4359] shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#4f80b9]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#fff7cc]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#4f80b9]/20 text-[#dceeff] border border-[#7da7d9]/30 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#fff7cc]" />
            Học phần: Đánh giá & Kiểm định chất lượng phần mềm (SQA)
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Ôn Luyện Trắc Nghiệm <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dceeff] via-white to-[#fff7cc]">Chuẩn Đề Thi Thật</span>
          </h1>
          <p className="text-[#dceeff]/85 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            Ngân hàng chính thức <strong>{questions.length} câu hỏi</strong> chuẩn hoá theo ma trận đề thi 6 nhóm kiến thức, bao gồm đồ thị CFG, DFG, kiểm thử hộp trắng/hộp đen và chấm điểm tự động.
          </p>

          {/* Quick Action 1-Click Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartStandard}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#4f80b9] hover:bg-[#4372a7] active:bg-[#396395] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#4f80b9]/30 hover:shadow-[#4f80b9]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Vào Thi Đề Chuẩn (50 Câu - 60 Phút)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleScrollToCustom}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all hover:border-[#fff7cc]/40"
            >
              <Target className="w-4 h-4 text-[#fff7cc]" />
              <span>Tùy Chỉnh Số Câu & Phút</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Pill Bar inside Hero */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4f80b9]/25 text-[#dceeff] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#a6c5e8]">Ngân hàng chuẩn</p>
              <p className="text-sm sm:text-base font-bold text-white">{questions.length} Câu</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fff7cc]/15 text-[#fff7cc] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#a6c5e8]">Phân loại</p>
              <p className="text-sm sm:text-base font-bold text-white">6 Nhóm / 2 CĐR</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#a6c5e8]">Điều kiện Đạt</p>
              <p className="text-sm sm:text-base font-bold text-white">≥ 5.0 / 10 Điểm</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fff7cc]/20 text-[#fff7cc] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#a6c5e8]">Tiến trình</p>
              <p className="text-sm sm:text-base font-bold text-white">Lưu Tự Động</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Fast Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Chế Độ Luyện Nhanh (Fast Modes)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Chọn một chế độ để bắt đầu ngay lập tức
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Preset 1: Speed Run */}
          <div
            onClick={() =>
              launchPreset({
                title: '⚡ Luyện Thi Tốc Độ (15 câu - 15 phút)',
                count: 15,
                minutes: 15,
                groups: [1, 2, 4, 5],
                immediate: false
              })
            }
            className="group relative p-5 rounded-2xl bg-white dark:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#2e4359] hover:border-[#fde047] dark:hover:border-[#fde047] hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff7cc] text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-200 bg-[#fff7cc] dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-[#fde047]/60 dark:border-amber-800/60">
                15 Phút
              </span>
            </div>
            <h3 className="font-bold text-[#152230] dark:text-[#f4f8fd] group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
              Luyện Tốc Độ
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#a6c5e8] mt-1">
              15 câu hỏi trọng tâm dễ & vừa, tăng tốc phản xạ giải trắc nghiệm.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
              <span>Bắt đầu ngay</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Preset 2: Hard Challenges */}
          <div
            onClick={() =>
              launchPreset({
                title: '🔥 Thử Thách Câu Khó (Group 3 & Group 6 - 20 câu)',
                count: 20,
                minutes: 30,
                groups: [3, 6],
                immediate: false
              })
            }
            className="group relative p-5 rounded-2xl bg-white dark:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#2e4359] hover:border-[#c25e5e] dark:hover:border-[#e89292] hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#fdf2f4] dark:bg-[#351e24] text-[#c25e5e] dark:text-[#e89292] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#b04848] dark:text-[#f0a8a8] bg-[#fdf2f4] dark:bg-[#351e24] px-2 py-0.5 rounded-md border border-[#f5c6cb] dark:border-[#522b34]">
                Mức Khó
              </span>
            </div>
            <h3 className="font-bold text-[#152230] dark:text-[#f4f8fd] group-hover:text-[#c25e5e] dark:group-hover:text-[#e89292] transition-colors">
              Chinh Phục Câu Khó
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#a6c5e8] mt-1">
              Tập trung câu hỏi nhóm 3 & 6: Độ phức tạp Cyclomatic, CFG, DFG, kiểm thử đường cơ sở.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 group-hover:text-[#c25e5e] dark:group-hover:text-[#e89292] transition-colors">
              <span>Bắt đầu ngay</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Preset 3: Practice with Explanations */}
          <div
            onClick={() =>
              launchPreset({
                title: '💡 Luyện Tập Từng Câu (Xem kết quả ngay)',
                count: 25,
                minutes: 0,
                groups: [1, 2, 3, 4, 5, 6],
                immediate: true
              })
            }
            className="group relative p-5 rounded-2xl bg-white dark:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#2e4359] hover:border-[#4f80b9] dark:hover:border-[#7da7d9] hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e6f1fc] dark:bg-[#152230] text-[#4f80b9] dark:text-[#7da7d9] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#4f80b9] dark:text-[#7da7d9] bg-[#e6f1fc] dark:bg-[#152230] px-2 py-0.5 rounded-md border border-[#d0e4f7] dark:border-[#2e4359]">
                Có Giải Thích
              </span>
            </div>
            <h3 className="font-bold text-[#152230] dark:text-[#f4f8fd] group-hover:text-[#4f80b9] dark:group-hover:text-[#7da7d9] transition-colors">
              Luyện Tập Kèm Giải Thích
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#a6c5e8] mt-1">
              Không bấm giờ, chọn đáp án là biết đúng/sai và xem ngay giải thích cặn kẽ.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 group-hover:text-[#4f80b9] dark:group-hover:text-[#7da7d9] transition-colors">
              <span>Bắt đầu ngay</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Standard Matrix vs Custom Configurator */}
      <div ref={customSectionRef} className="flex border-b border-[#dceeff] dark:border-[#2e4359] scroll-mt-20">
        <button
          onClick={() => setActiveSubTab('standard')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'standard'
              ? 'border-[#4f80b9] text-[#4f80b9] dark:border-[#7da7d9] dark:text-[#7da7d9]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Ma Trận Đề Thi Chuẩn (50 Câu)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('custom')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'custom'
              ? 'border-[#4f80b9] text-[#4f80b9] dark:border-[#7da7d9] dark:text-[#7da7d9]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tự Cấu Hình Số Câu & Nhóm</span>
        </button>
      </div>

      {activeSubTab === 'standard' ? (
        <div className="rounded-2xl bg-white dark:bg-[#1c2c3d] p-6 sm:p-8 border border-[#dceeff] dark:border-[#2e4359] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Cấu Trúc Ma Trận Đề Thi Chuẩn SQA
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Tỷ lệ chuẩn phân bố theo quy chế thi kết thúc học phần
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/60 dark:border-blue-800/60">
                50 Câu hỏi
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200/60 dark:border-amber-800/60">
                60 Phút
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                Thang điểm 10
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nhóm câu hỏi</th>
                  <th className="py-3 px-4">Chuẩn đầu ra</th>
                  <th className="py-3 px-4">Mức độ khó</th>
                  <th className="py-3 px-4 text-center">Số câu trong đề</th>
                  <th className="py-3 px-4 text-center">Ngân hàng có</th>
                  <th className="py-3 px-4 text-right">Điểm số ước tính</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Nhóm 1</td>
                  <td className="py-3 px-4 text-[#4f80b9] dark:text-[#7da7d9] font-medium">CĐR 1.1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">DỄ</span></td>
                  <td className="py-3 px-4 text-center font-bold text-[#4f80b9] dark:text-[#7da7d9]">10 câu</td>
                  <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">49 câu</td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 font-semibold">2.0 đ</td>
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Nhóm 2</td>
                  <td className="py-3 px-4 text-[#4f80b9] dark:text-[#7da7d9] font-medium">CĐR 1.1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md text-xs bg-[#fff7cc] dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-[#fde047] dark:border-amber-800">TRUNG BÌNH</span></td>
                  <td className="py-3 px-4 text-center font-bold text-[#4f80b9] dark:text-[#7da7d9]">15 câu</td>
                  <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">97 câu</td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 font-semibold">3.0 đ</td>
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Nhóm 3</td>
                  <td className="py-3 px-4 text-[#4f80b9] dark:text-[#7da7d9] font-medium">CĐR 1.1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md text-xs bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border border-[#f5c6cb] dark:border-[#522b34]">KHÓ</span></td>
                  <td className="py-3 px-4 text-center font-bold text-[#4f80b9] dark:text-[#7da7d9]">3 câu</td>
                  <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">19 câu</td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 font-semibold">0.6 đ</td>
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Nhóm 4</td>
                  <td className="py-3 px-4 text-[#4f80b9] dark:text-[#7da7d9] font-medium">CĐR 2.1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">DỄ</span></td>
                  <td className="py-3 px-4 text-center font-bold text-[#4f80b9] dark:text-[#7da7d9]">5 câu</td>
                  <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">20 câu</td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 font-semibold">1.0 đ</td>
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Nhóm 5</td>
                  <td className="py-3 px-4 text-[#4f80b9] dark:text-[#7da7d9] font-medium">CĐR 2.1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md text-xs bg-[#fff7cc] dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-[#fde047] dark:border-amber-800">TRUNG BÌNH</span></td>
                  <td className="py-3 px-4 text-center font-bold text-[#4f80b9] dark:text-[#7da7d9]">12 câu</td>
                  <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">74 câu</td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 font-semibold">2.4 đ</td>
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Nhóm 6</td>
                  <td className="py-3 px-4 text-[#4f80b9] dark:text-[#7da7d9] font-medium">CĐR 2.1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md text-xs bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border border-[#f5c6cb] dark:border-[#522b34]">KHÓ</span></td>
                  <td className="py-3 px-4 text-center font-bold text-[#4f80b9] dark:text-[#7da7d9]">5 câu</td>
                  <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">40 câu</td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 font-semibold">1.0 đ</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50/80 dark:bg-slate-800/80 font-bold border-t border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                <tr>
                  <td colSpan={3} className="py-3 px-4">
                    Tổng cộng (CĐR 1.1: 28 câu = 5.6đ | CĐR 2.1: 22 câu = 4.4đ)
                  </td>
                  <td className="py-3 px-4 text-center text-[#4f80b9] dark:text-[#7da7d9] text-base">50 câu</td>
                  <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">{questions.length} câu</td>
                  <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 text-base">10.0 đ</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartStandard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#4f80b9] hover:bg-[#4372a7] active:bg-[#396395] text-white font-bold text-base shadow-lg shadow-[#4f80b9]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Bắt Đầu Làm Đề Chuẩn Ngay</span>
            </button>
          </div>
        </div>
      ) : (
        /* Custom Setup View */
        <div className="rounded-2xl bg-white dark:bg-[#1c2c3d] p-6 sm:p-8 border border-[#dceeff] dark:border-[#2e4359] shadow-sm space-y-8">
          <div>
            <h3 className="text-xl font-bold text-[#152230] dark:text-[#f4f8fd]">
              Tùy Chỉnh Cấu Hình Bài Kiểm Tra
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#a6c5e8] mt-1">
              Lựa chọn số lượng câu, thời gian và phạm vi các nhóm kiến thức theo nhu cầu cá nhân
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Count & Time */}
            <div className="space-y-6">
              {/* Question Count */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#152230] dark:text-[#f4f8fd] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#4f80b9] dark:text-[#7da7d9]" />
                    Số lượng câu hỏi:
                  </label>
                  <span className="text-base font-extrabold text-[#4f80b9] dark:text-[#7da7d9] px-3 py-1 bg-[#e6f1fc] dark:bg-[#152230] rounded-xl border border-[#d0e4f7] dark:border-[#2e4359]">
                    {questionCount} câu
                  </span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={questions.length}
                  step={5}
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-[#4f80b9] cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {[10, 20, 30, 50, 100, questions.length].map(val => (
                    <button
                      key={val}
                      onClick={() => setQuestionCount(val)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                        questionCount === val
                          ? 'bg-[#4f80b9] text-white border-[#4f80b9] font-bold dark:bg-[#4f80b9]'
                          : 'bg-slate-50 dark:bg-[#152230] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2e4359] hover:bg-slate-100 dark:hover:bg-[#233446]'
                      }`}
                    >
                      {val === questions.length ? `Tất cả (${val})` : `${val} câu`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Minutes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#152230] dark:text-[#f4f8fd] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#4f80b9] dark:text-[#7da7d9]" />
                    Thời gian làm bài:
                  </label>
                  <span className="text-base font-extrabold text-[#4f80b9] dark:text-[#7da7d9] px-3 py-1 bg-[#e6f1fc] dark:bg-[#152230] rounded-xl border border-[#d0e4f7] dark:border-[#2e4359]">
                    {durationMinutes === 0 ? 'Không giới hạn' : `${durationMinutes} phút`}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={120}
                  step={5}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full accent-[#4f80b9] cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {[0, 15, 30, 45, 60, 90].map(val => (
                    <button
                      key={val}
                      onClick={() => setDurationMinutes(val)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                        durationMinutes === val
                          ? 'bg-[#4f80b9] text-white border-[#4f80b9] font-bold dark:bg-[#4f80b9]'
                          : 'bg-slate-50 dark:bg-[#152230] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2e4359] hover:bg-slate-100 dark:hover:bg-[#233446]'
                      }`}
                    >
                      {val === 0 ? 'Tự do' : `${val}p`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-[#dceeff] dark:border-[#2e4359] hover:bg-[#f4f8fd] dark:hover:bg-[#233446]/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Shuffle className="w-4 h-4 text-[#4f80b9] dark:text-[#7da7d9]" />
                    <div>
                      <span className="text-sm font-semibold text-[#152230] dark:text-[#f4f8fd]">Xáo trộn thứ tự câu hỏi</span>
                      <p className="text-[11px] text-slate-500 dark:text-[#a6c5e8]">Đảo ngẫu nhiên vị trí các câu hỏi khi bắt đầu</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={e => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 accent-[#4f80b9] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-[#dceeff] dark:border-[#2e4359] hover:bg-[#f4f8fd] dark:hover:bg-[#233446]/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-sm font-semibold text-[#152230] dark:text-[#f4f8fd]">Chế độ hiển thị đáp án ngay</span>
                      <p className="text-[11px] text-slate-500 dark:text-[#a6c5e8]">Xem giải thích và kết quả đúng/sai ngay sau khi chọn</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={immediateFeedback}
                    onChange={e => setImmediateFeedback(e.target.checked)}
                    className="w-4 h-4 accent-[#4f80b9] rounded"
                  />
                </label>
              </div>
            </div>

            {/* Right: Group Selections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-[#152230] dark:text-[#f4f8fd] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#4f80b9] dark:text-[#7da7d9]" />
                  Chọn nhóm câu hỏi:
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={selectAllGroups}
                    className="text-[#4f80b9] dark:text-[#7da7d9] hover:underline font-semibold"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    onClick={deselectAllGroups}
                    className="text-slate-500 dark:text-slate-400 hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupStats.map(item => {
                  const isSelected = selectedGroups.includes(item.group);
                  return (
                    <div
                      key={item.group}
                      onClick={() => toggleGroup(item.group)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-[#dceeff]/35 dark:bg-[#233446]/60 border-[#4f80b9] dark:border-[#7da7d9] shadow-xs ring-1 ring-[#4f80b9]/30'
                          : 'bg-white dark:bg-[#1c2c3d] border-[#dceeff] dark:border-[#2e4359] opacity-60 hover:opacity-100 hover:border-[#4f80b9]/50'
                      }`}
                    >
                      {/* Top: Checkbox, Name, and Difficulty Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-[#4f80b9] border-[#4f80b9] text-white dark:bg-[#4f80b9]'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-bold text-[#152230] dark:text-[#f4f8fd]">
                            Nhóm {item.group}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-center leading-tight shrink-0 ${
                            item.diff === 'DỄ'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : item.diff === 'TRUNG BÌNH'
                              ? 'bg-[#fff7cc] dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-[#fde047] dark:border-amber-800'
                              : 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border border-[#f5c6cb] dark:border-[#522b34]'
                          }`}
                        >
                          {item.diff}
                        </span>
                      </div>

                      {/* Bottom: Count & CDR Badge */}
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-xs text-slate-500 dark:text-[#a6c5e8] font-medium">
                          {item.count} câu hỏi
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#e6f1fc] dark:bg-[#152230] text-[#2f4860] dark:text-[#a6c5e8] border border-[#d0e4f7] dark:border-[#2e4359]">
                          {item.cdr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#dceeff] dark:border-[#2e4359]">
            <button
              onClick={handleStartCustom}
              disabled={selectedGroups.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#4f80b9] hover:bg-[#4372a7] active:bg-[#396395] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-[#4f80b9]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Bắt Đầu Làm Bài Theo Cấu Hình</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
