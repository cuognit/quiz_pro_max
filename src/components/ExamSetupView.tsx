import React, { useState, useMemo, useRef } from 'react';
import {
  Play,
  Clock,
  HelpCircle,
  Layers,
  Sparkles,
  Zap,
  Target,
  Shuffle,
  Eye,
  Check,
  ArrowRight,
  Code2,
  BookOpen,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { CdrType, Difficulty, ExamConfig, Question } from '../types/quiz';
import { ALL_BATCH_GROUPS, ALL_CDRS, BATCH_INFO } from '../utils/examEngine';

interface ExamSetupViewProps {
  questions: Question[];
  onStartExam: (config: ExamConfig) => void;
}

const ALL_DIFFICULTIES: Difficulty[] = ['DỄ', 'TRUNG BÌNH', 'KHÓ'];

export const ExamSetupView: React.FC<ExamSetupViewProps> = ({
  questions,
  onStartExam
}) => {
  const configSectionRef = useRef<HTMLDivElement>(null);

  // Custom configuration state
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([...ALL_BATCH_GROUPS]);
  const [selectedCdrs, setSelectedCdrs] = useState<CdrType[]>([...ALL_CDRS]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([
    ...ALL_DIFFICULTIES
  ]);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [immediateFeedback, setImmediateFeedback] = useState<boolean>(false);

  // Stats per Batch (1..5)
  const batchStats = useMemo(() => {
    return ALL_BATCH_GROUPS.map(g => {
      const list = questions.filter(q => q.group === g);
      const multiCount = list.filter(q => q.isMultiSelect).length;
      const info = BATCH_INFO[g];
      return {
        group: g,
        count: list.length,
        multiCount,
        shortName: info?.shortName || `Batch ${g}`,
        name: info?.name || `Batch ${g}`,
        desc: info?.desc || ''
      };
    });
  }, [questions]);

  // Filtered pool count matching current selections
  const matchingPoolCount = useMemo(() => {
    return questions.filter(q => {
      if (selectedGroups.length > 0 && !selectedGroups.includes(q.group)) return false;
      if (selectedCdrs.length > 0 && !selectedCdrs.includes(q.cdr)) return false;
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(q.difficulty)) return false;
      return true;
    }).length;
  }, [questions, selectedGroups, selectedCdrs, selectedDifficulties]);

  const effectiveMax = Math.max(1, matchingPoolCount || questions.length);
  const effectiveQuestionCount = Math.min(questionCount, effectiveMax);

  const toggleGroup = (g: number) => {
    setSelectedGroups(prev =>
      prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g].sort((a, b) => a - b)
    );
  };

  const toggleCdr = (cdr: CdrType) => {
    setSelectedCdrs(prev =>
      prev.includes(cdr) ? prev.filter(item => item !== cdr) : [...prev, cdr]
    );
  };

  const toggleDifficulty = (diff: Difficulty) => {
    setSelectedDifficulties(prev =>
      prev.includes(diff) ? prev.filter(item => item !== diff) : [...prev, diff]
    );
  };

  const handleStartCustom = () => {
    const activeGroups = selectedGroups.length > 0 ? selectedGroups : [...ALL_BATCH_GROUPS];
    const activeCdrs = selectedCdrs.length > 0 ? selectedCdrs : [...ALL_CDRS];
    const activeDiffs =
      selectedDifficulties.length > 0 ? selectedDifficulties : [...ALL_DIFFICULTIES];

    const batchLabel =
      activeGroups.length === 5
        ? 'Tổng Hợp'
        : activeGroups.map(g => `B${g}`).join('+');

    onStartExam({
      mode: immediateFeedback ? 'practice' : 'custom',
      title: immediateFeedback
        ? `Luyện Tập Big Data ${batchLabel} (${effectiveQuestionCount} câu)`
        : `Đề Tự Chọn Big Data ${batchLabel} (${effectiveQuestionCount} câu - ${
            durationMinutes > 0 ? `${durationMinutes} phút` : 'Tự do'
          })`,
      questionCount: effectiveQuestionCount,
      durationMinutes,
      selectedGroups: activeGroups,
      selectedCdrs: activeCdrs,
      selectedDifficulties: activeDiffs,
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
      selectedCdrs: [...ALL_CDRS],
      selectedDifficulties: [...ALL_DIFFICULTIES],
      shuffleQuestions: true,
      shuffleOptions: false,
      immediateFeedback: preset.immediate
    });
  };

  const multiSelectTotal = useMemo(
    () => questions.filter(q => q.isMultiSelect).length,
    [questions]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      {/* Modern Hero & Quick Presets */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#152230] via-[#1c2c3d] to-[#152230] text-white p-6 sm:p-8 border border-[#2e4359] shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#4f80b9]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#fff7cc]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#4f80b9]/20 text-[#dceeff] border border-[#7da7d9]/30 mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#fff7cc]" />
              Học phần: Dữ Liệu Lớn (Big Data) · 5 Batch Chuẩn Hóa
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2.5 leading-tight">
              Tự Cấu Hình Đề Thi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dceeff] via-white to-[#fff7cc]">
                Big Data Practice Lab
              </span>
            </h1>
            <p className="text-[#dceeff]/85 text-sm sm:text-base leading-relaxed">
              Ngân hàng trọn bộ <strong>{questions.length} câu hỏi</strong> (gồm{' '}
              <strong>{multiSelectTotal} câu chọn nhiều đáp án</strong> chấm điểm từng phần, code
              truy vấn SQL / Spark / MongoDB / Neo4j / Redis / Splunk và giải thích chi tiết).
            </p>
          </div>

          {/* Quick 1-Click Presets */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0 lg:w-[370px]">
            <button
              type="button"
              onClick={() =>
                launchPreset({
                  title: 'Luyện Nhanh Big Data (15 Câu - 15 Phút)',
                  count: 15,
                  minutes: 15,
                  groups: [...ALL_BATCH_GROUPS],
                  immediate: false
                })
              }
              className="flex flex-col items-start gap-1 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-[#fff7cc] text-xs font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>Luyện Nhanh</span>
              </div>
              <span className="text-xs text-[#dceeff]/85">15 câu · 15 phút</span>
            </button>

            <button
              type="button"
              onClick={() =>
                launchPreset({
                  title: 'Tổng Ôn Big Data (40 Câu - 45 Phút)',
                  count: 40,
                  minutes: 45,
                  groups: [...ALL_BATCH_GROUPS],
                  immediate: false
                })
              }
              className="flex flex-col items-start gap-1 p-3.5 rounded-2xl bg-[#4f80b9]/40 hover:bg-[#4f80b9]/55 border border-[#7da7d9]/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                <Target className="w-3.5 h-3.5 text-[#fff7cc]" />
                <span>Tổng Ôn 5 Batch</span>
              </div>
              <span className="text-xs text-[#dceeff]/90">40 câu · 45 phút</span>
            </button>

            <button
              type="button"
              onClick={() =>
                launchPreset({
                  title: 'Thực Chiến Code Batch 5 (30 Câu)',
                  count: 30,
                  minutes: 0,
                  groups: [5],
                  immediate: true
                })
              }
              className="flex flex-col items-start gap-1 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
                <Code2 className="w-3.5 h-3.5" />
                <span>Thực Chiến Batch 5</span>
              </div>
              <span className="text-xs text-[#dceeff]/85">30 câu · Hiện đáp án</span>
            </button>

            <button
              type="button"
              onClick={() =>
                launchPreset({
                  title: `Ôn Toàn Bộ ${questions.length} Câu Big Data`,
                  count: questions.length,
                  minutes: 0,
                  groups: [...ALL_BATCH_GROUPS],
                  immediate: true
                })
              }
              className="flex flex-col items-start gap-1 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-sky-300 text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ôn Hết Ngân Hàng</span>
              </div>
              <span className="text-xs text-[#dceeff]/85">{questions.length} câu · Tự do</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Custom Exam Configurator */}
      <div
        ref={configSectionRef}
        className="rounded-3xl bg-[var(--card-surface)] border border-[var(--border-subtle)] shadow-sm p-5 sm:p-7 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4f80b9]/15 text-[#4f80b9] dark:text-[#7da7d9] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                Cấu Hình Đề Thi Theo Ý Muốn
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chọn Batch kiến thức, CĐR, độ khó, số câu hỏi và thời gian làm bài phù hợp.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#f4f8fd] dark:bg-[#1c2c3d] border border-[#dceeff] dark:border-[#293d52] text-xs font-bold text-[#152230] dark:text-[#dceeff] self-start sm:self-auto">
            <Layers className="w-4 h-4 text-[#4f80b9]" />
            <span>
              Khả dụng: <strong className="text-[#4f80b9] dark:text-[#fff7cc]">{matchingPoolCount}</strong> / {questions.length} câu
            </span>
          </div>
        </div>

        {/* Step 1: Select Batches (1..5) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#4f80b9] text-white text-xs font-extrabold inline-flex items-center justify-center">
                1
              </span>
              Chọn Batch kiến thức ({selectedGroups.length}/5)
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedGroups([...ALL_BATCH_GROUPS])}
                className="font-semibold text-[#4f80b9] hover:underline cursor-pointer"
              >
                Chọn tất cả
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                type="button"
                onClick={() => setSelectedGroups([])}
                className="font-semibold text-slate-500 hover:text-rose-500 cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {batchStats.map(b => {
              const isSelected = selectedGroups.includes(b.group);
              return (
                <button
                  key={b.group}
                  type="button"
                  onClick={() => toggleGroup(b.group)}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#4f80b9]/10 dark:bg-[#4f80b9]/20 border-[#4f80b9] ring-1 ring-[#4f80b9]/40 shadow-xs'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] hover:border-[#4f80b9]/50 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                          isSelected
                            ? 'bg-[#4f80b9] text-white'
                            : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {b.shortName}
                      </span>
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#4f80b9] border-[#4f80b9] text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)] leading-snug mb-1">
                      {b.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#4f80b9] dark:text-[#7da7d9]">
                      {b.count} câu
                    </span>
                    {b.multiCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                        <CheckSquare className="w-3 h-3" />
                        {b.multiCount} đa đáp án
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Optional CĐR & Difficulty filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Lọc theo Chuẩn đầu ra (CĐR)
              </span>
              <button
                type="button"
                onClick={() => setSelectedCdrs([...ALL_CDRS])}
                className="text-[11px] font-semibold text-[#4f80b9] hover:underline cursor-pointer"
              >
                Tất cả
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_CDRS.map(cdr => {
                const active = selectedCdrs.includes(cdr);
                const count = questions.filter(q => q.cdr === cdr).length;
                return (
                  <button
                    key={cdr}
                    type="button"
                    onClick={() => toggleCdr(cdr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#4f80b9] text-white border-[#4f80b9] shadow-xs'
                        : 'bg-[var(--card-surface)] text-slate-600 dark:text-slate-300 border-[var(--border-subtle)] hover:border-[#4f80b9]/50'
                    }`}
                  >
                    {cdr} <span className="opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Lọc theo Độ khó
              </span>
              <button
                type="button"
                onClick={() => setSelectedDifficulties([...ALL_DIFFICULTIES])}
                className="text-[11px] font-semibold text-[#4f80b9] hover:underline cursor-pointer"
              >
                Tất cả
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_DIFFICULTIES.map(diff => {
                const active = selectedDifficulties.includes(diff);
                const count = questions.filter(q => q.difficulty === diff).length;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => toggleDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#4f80b9] text-white border-[#4f80b9] shadow-xs'
                        : 'bg-[var(--card-surface)] text-slate-600 dark:text-slate-300 border-[var(--border-subtle)] hover:border-[#4f80b9]/50'
                    }`}
                  >
                    {diff} <span className="opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Question Count & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question Count */}
          <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#4f80b9]" />
                Số lượng câu hỏi
              </label>
              <span className="px-2.5 py-1 rounded-lg bg-[#4f80b9]/15 text-[#4f80b9] dark:text-[#7da7d9] font-extrabold text-sm font-mono">
                {effectiveQuestionCount} câu
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={effectiveMax}
              step={1}
              value={effectiveQuestionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full accent-[#4f80b9] cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5">
              {[10, 20, 30, 40, 60, effectiveMax].map((preset, idx) => {
                const val = Math.min(preset, effectiveMax);
                const label = idx === 5 ? `Tất cả (${effectiveMax})` : `${val} câu`;
                return (
                  <button
                    key={`${idx}-${val}`}
                    type="button"
                    onClick={() => setQuestionCount(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      effectiveQuestionCount === val
                        ? 'bg-[#4f80b9] text-white border-[#4f80b9]'
                        : 'bg-[var(--card-surface)] text-slate-600 dark:text-slate-300 border-[var(--border-subtle)] hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4f80b9]" />
                Thời gian làm bài
              </label>
              <span className="px-2.5 py-1 rounded-lg bg-[#4f80b9]/15 text-[#4f80b9] dark:text-[#7da7d9] font-extrabold text-sm font-mono">
                {durationMinutes > 0 ? `${durationMinutes} phút` : 'Không giới hạn'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              step={5}
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-[#4f80b9] cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5">
              {[0, 15, 30, 45, 60, 90].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    durationMinutes === mins
                      ? 'bg-[#4f80b9] text-white border-[#4f80b9]'
                      : 'bg-[var(--card-surface)] text-slate-600 dark:text-slate-300 border-[var(--border-subtle)] hover:bg-[var(--hover-bg)]'
                  }`}
                >
                  {mins === 0 ? 'Tự do' : `${mins} phút`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Mode toggles & Launch Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShuffleQuestions(prev => !prev)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                shuffleQuestions
                  ? 'bg-[#4f80b9]/15 text-[#4f80b9] dark:text-[#7da7d9] border-[#4f80b9]/40'
                  : 'bg-[var(--bg-canvas)] text-slate-500 border-[var(--border-subtle)]'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              <span>Trộn thứ tự câu hỏi: {shuffleQuestions ? 'BẬT' : 'TẮT'}</span>
            </button>

            <button
              type="button"
              onClick={() => setImmediateFeedback(prev => !prev)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                immediateFeedback
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40'
                  : 'bg-[var(--bg-canvas)] text-slate-500 border-[var(--border-subtle)]'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Xem đáp án ngay (Luyện tập): {immediateFeedback ? 'BẬT' : 'TẮT'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartCustom}
            disabled={matchingPoolCount === 0}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#4f80b9] to-[#396395] hover:from-[#4372a7] hover:to-[#2e5682] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#4f80b9]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              Bắt Đầu Làm Bài ({effectiveQuestionCount} Câu ·{' '}
              {durationMinutes > 0 ? `${durationMinutes}p` : 'Tự do'})
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
