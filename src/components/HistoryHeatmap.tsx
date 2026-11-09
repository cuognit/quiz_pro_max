import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Calendar,
  Layers,
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ExamResult } from '../types/quiz';

interface HistoryHeatmapProps {
  history: ExamResult[];
  onSelectExam?: (exam: ExamResult) => void;
}

type ViewDimension = 'group' | 'cdr' | 'difficulty';

interface CategoryRow {
  id: string;
  key: string | number;
  label: string;
  subLabel: string;
  badge: string;
  badgeColor: string;
}

interface CellData {
  examId: string;
  examIndex: number;
  examTitle: string;
  dateStr: string;
  categoryId: string;
  categoryLabel: string;
  total: number;
  correct: number;
  percentage: number | null; // null if 0 questions in that exam
  score10: number;
  examResult: ExamResult;
}

const GROUP_ROWS: CategoryRow[] = [
  {
    id: 'group_1',
    key: 1,
    label: 'Group 1: Nhận biết & Khái niệm',
    subLabel: 'Lý thuyết cơ bản, thuật ngữ kiểm thử',
    badge: 'CĐR 1.1 • DỄ',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'group_2',
    key: 2,
    label: 'Group 2: Kỹ thuật kiểm thử & Phân loại',
    subLabel: 'Kiểm thử hộp đen, phân hoạch tương đương, biên',
    badge: 'CĐR 1.1 • TB',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  {
    id: 'group_3',
    key: 3,
    label: 'Group 3: Vận dụng & Độ phức tạp',
    subLabel: 'Độ phức tạp Cyclomatic, bao phủ nhánh, đường',
    badge: 'CĐR 1.1 • KHÓ',
    badgeColor: 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border-[#f5c6cb] dark:border-[#522b34]'
  },
  {
    id: 'group_4',
    key: 4,
    label: 'Group 4: Công cụ & Thuật ngữ SQA',
    subLabel: 'Sơ đồ ký hiệu, khung kiểm thử đơn vị, tiêu chuẩn',
    badge: 'CĐR 2.1 • DỄ',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'group_5',
    key: 5,
    label: 'Group 5: Luồng điều khiển & Bao phủ',
    subLabel: 'CFG, bảng quyết định, thuật toán kiểm thử hộp trắng',
    badge: 'CĐR 2.1 • TB',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  {
    id: 'group_6',
    key: 6,
    label: 'Group 6: Luồng dữ liệu, DFG & Nâng cao',
    subLabel: 'DFG, def-use pair, bất thường luồng dữ liệu, state',
    badge: 'CĐR 2.1 • KHÓ',
    badgeColor: 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border-[#f5c6cb] dark:border-[#522b34]'
  }
];

const CDR_ROWS: CategoryRow[] = [
  {
    id: 'cdr_1_1',
    key: 'CĐR 1.1',
    label: 'CĐR 1.1: Lý Thuyết & Kỹ Thuật Cơ Sở',
    subLabel: 'Kiểm thử hộp đen, kiểm thử tĩnh, mô hình chất lượng',
    badge: '28 câu / đề chuẩn (5.6đ)',
    badgeColor: 'bg-[#e6f1fc] dark:bg-[#152230] text-[#4f80b9] dark:text-[#7da7d9] border-[#d0e4f7] dark:border-[#2e4359]'
  },
  {
    id: 'cdr_2_1',
    key: 'CĐR 2.1',
    label: 'CĐR 2.1: Thực Hành Kỹ Thuật & Công Cụ',
    subLabel: 'Kiểm thử hộp trắng, CFG, DFG, bao phủ dòng lệnh/nhánh',
    badge: '22 câu / đề chuẩn (4.4đ)',
    badgeColor: 'bg-[#e6f1fc] dark:bg-[#152230] text-[#4f80b9] dark:text-[#7da7d9] border-[#d0e4f7] dark:border-[#2e4359]'
  }
];

const DIFFICULTY_ROWS: CategoryRow[] = [
  {
    id: 'diff_de',
    key: 'DỄ',
    label: 'Mức Độ DỄ (Nhận biết)',
    subLabel: 'Khái niệm cơ bản, định nghĩa, chuẩn bị kiểm thử',
    badge: '15 câu / đề chuẩn (2.0đ)',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'diff_tb',
    key: 'TRUNG BÌNH',
    label: 'Mức Độ TRUNG BÌNH (Thông hiểu)',
    subLabel: 'Áp dụng phân hoạch tương đương, biên, bảng quyết định',
    badge: '27 câu / đề chuẩn (5.4đ)',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  {
    id: 'diff_kho',
    key: 'KHÓ',
    label: 'Mức Độ KHÓ (Vận dụng cao)',
    subLabel: 'Tính độ phức tạp chu trình, đồ thị CFG/DFG, luồng dữ liệu',
    badge: '8 câu / đề chuẩn (2.6đ)',
    badgeColor: 'bg-[#fdf2f4] dark:bg-[#351e24] text-[#b04848] dark:text-[#f0a8a8] border-[#f5c6cb] dark:border-[#522b34]'
  }
];

export const HistoryHeatmap: React.FC<HistoryHeatmapProps> = ({
  history,
  onSelectExam
}) => {
  const [dimension, setDimension] = useState<ViewDimension>('group');
  const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);

  const chronologicalHistory = useMemo(() => {
    return [...history].sort((a, b) => a.completedAt - b.completedAt);
  }, [history]);

  const categories: CategoryRow[] = useMemo(() => {
    if (dimension === 'group') return GROUP_ROWS;
    if (dimension === 'cdr') return CDR_ROWS;
    return DIFFICULTY_ROWS;
  }, [dimension]);

  const colorScale = useMemo(() => {
    return d3
      .scaleLinear<string>()
      .domain([0, 35, 50, 75, 100])
      .range(['#fdf2f4', '#f8d7da', '#fff7cc', '#dceeff', '#10b981'])
      .clamp(true);
  }, []);

  const textColorScale = useMemo(() => {
    return (pct: number | null) => {
      if (pct === null) return 'text-slate-400 dark:text-slate-500';
      if (pct >= 75) return 'text-emerald-950 font-bold';
      if (pct >= 50) return 'text-amber-950 font-bold';
      return 'text-[#6b2525] font-bold';
    };
  }, []);

  const matrixData: { row: CategoryRow; cells: CellData[]; average: number; trend: number }[] =
    useMemo(() => {
      return categories.map(cat => {
        let totalQuestionsCategory = 0;
        let totalCorrectCategory = 0;
        const examPercentages: number[] = [];

        const cells: CellData[] = chronologicalHistory.map((exam, idx) => {
          let stat: { total: number; correct: number; percentage: number } | undefined;

          if (dimension === 'group') {
            stat = exam.breakdownByGroup[cat.key as number];
          } else if (dimension === 'cdr') {
            stat = exam.breakdownByCdr[cat.key as string];
          } else {
            stat = exam.breakdownByDifficulty[cat.key as string];
          }

          const hasData = stat && stat.total > 0;
          const total = hasData ? stat.total : 0;
          const correct = hasData ? stat.correct : 0;
          const percentage = hasData ? stat.percentage : null;

          if (percentage !== null) {
            totalQuestionsCategory += total;
            totalCorrectCategory += correct;
            examPercentages.push(percentage);
          }

          const d = new Date(exam.completedAt);
          const dateStr = `${d.getDate()}/${d.getMonth() + 1} ${d.getHours().toString().padStart(2, '0')}:${d
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;

          return {
            examId: exam.id,
            examIndex: idx + 1,
            examTitle: exam.title,
            dateStr,
            categoryId: cat.id,
            categoryLabel: cat.label,
            total,
            correct,
            percentage,
            score10: exam.score10,
            examResult: exam
          };
        });

        const average =
          totalQuestionsCategory > 0
            ? Math.round((totalCorrectCategory / totalQuestionsCategory) * 100)
            : 0;

        let trend = 0;
        if (examPercentages.length >= 2) {
          const mid = Math.floor(examPercentages.length / 2);
          const firstHalf = examPercentages.slice(0, mid);
          const secondHalf = examPercentages.slice(mid);
          const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          trend = Math.round(avg2 - avg1);
        }

        return {
          row: cat,
          cells,
          average,
          trend
        };
      });
    }, [chronologicalHistory, categories, dimension]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1c2c3d] p-6 sm:p-8 border border-[#dceeff] dark:border-[#2e4359] shadow-sm space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#e6f1fc] dark:bg-[#152230] text-[#4f80b9] dark:text-[#7da7d9] flex items-center justify-center">
              <Flame className="w-4 h-4 fill-[#4f80b9] text-[#4f80b9] dark:fill-[#7da7d9] dark:text-[#7da7d9]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#152230] dark:text-[#f4f8fd]">
              Biểu Đồ Nhiệt Độ Năng Lực (Performance Heat Map)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#a6c5e8] mt-1">
            Theo dõi sự biến chuyển phong độ và mức độ nắm vững từng nhóm kiến thức SQA qua từng lần làm bài thi
          </p>
        </div>

        {/* Dimension Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#152230] p-1 rounded-xl self-start lg:self-auto text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setDimension('group')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dimension === 'group'
                ? 'bg-white dark:bg-[#1c2c3d] text-[#4f80b9] dark:text-[#7da7d9] shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            6 Nhóm Đề Thi
          </button>
          <button
            onClick={() => setDimension('cdr')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dimension === 'cdr'
                ? 'bg-white dark:bg-[#1c2c3d] text-[#4f80b9] dark:text-[#7da7d9] shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Chuẩn Đầu Ra (CĐR)
          </button>
          <button
            onClick={() => setDimension('difficulty')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dimension === 'difficulty'
                ? 'bg-white dark:bg-[#1c2c3d] text-[#4f80b9] dark:text-[#7da7d9] shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mức Độ Khó
          </button>
        </div>
      </div>

      {/* Heat Map Matrix Area */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          {/* Header Row: Timeline of Exams */}
          <div className="flex items-end mb-2">
            <div className="w-64 sm:w-72 shrink-0 pr-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Chuyên mục / Nhóm
            </div>

            <div className="flex-1 flex items-end gap-2">
              {chronologicalHistory.map((exam, idx) => {
                const d = new Date(exam.completedAt);
                const timeLabel = `${d.getDate()}/${d.getMonth() + 1}`;

                return (
                  <div
                    key={exam.id}
                    className="flex-1 min-w-[54px] max-w-[72px] text-center"
                    title={`${exam.title} - ${d.toLocaleString('vi-VN')}`}
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 block truncate">
                      Bài #{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
                      {timeLabel}
                    </span>
                    <span className="text-[11px] font-extrabold text-[#4f80b9] dark:text-[#7da7d9] block mt-0.5 font-mono">
                      {exam.score10.toFixed(1)}đ
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="w-24 shrink-0 pl-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400">
              TB chung
            </div>

            <div className="w-24 shrink-0 pl-2 text-center text-xs font-bold text-slate-600 dark:text-slate-400">
              Xu hướng
            </div>
          </div>

          {/* Matrix Rows */}
          <div className="space-y-2">
            {matrixData.map(({ row, cells, average, trend }) => {
              return (
                <div
                  key={row.id}
                  className="flex items-center py-2 px-2.5 rounded-2xl hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  {/* Category Name & Badge */}
                  <div className="w-64 sm:w-72 shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {row.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${row.badgeColor}`}
                      >
                        {row.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate hidden sm:inline">
                        {row.subLabel}
                      </span>
                    </div>
                  </div>

                  {/* Heatmap Cells */}
                  <div className="flex-1 flex items-center gap-2">
                    {cells.map((cell) => {
                      const hasData = cell.percentage !== null;
                      const bgColor = hasData ? colorScale(cell.percentage!) : undefined;
                      const textColor = textColorScale(cell.percentage);
                      const isHovered =
                        hoveredCell?.examId === cell.examId &&
                        hoveredCell?.categoryId === cell.categoryId;

                      return (
                        <div
                          key={cell.examId}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => onSelectExam && onSelectExam(cell.examResult)}
                          className={`flex-1 min-w-[54px] max-w-[72px] h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative border ${
                            !hasData ? 'bg-slate-100 dark:bg-slate-800/60 border-transparent' : ''
                          } ${
                            isHovered
                              ? 'scale-108 z-10 shadow-lg ring-2 ring-[#4f80b9] border-white dark:border-slate-800'
                              : 'border-white/60 dark:border-slate-800/50 hover:scale-103'
                          }`}
                          style={bgColor ? { backgroundColor: bgColor } : undefined}
                        >
                          {hasData ? (
                            <>
                              <span className={`text-xs ${textColor}`}>
                                {cell.percentage}%
                              </span>
                              <span className="text-[9px] text-slate-700 dark:text-slate-800 font-bold opacity-80 font-mono">
                                {cell.correct}/{cell.total}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Average Mastery Pill */}
                  <div className="w-24 shrink-0 pl-4 text-center">
                    <div
                      className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-xs font-extrabold border"
                      style={{
                        backgroundColor: colorScale(average),
                        color: average >= 75 ? '#022c22' : average >= 50 ? '#451a03' : '#6b2525'
                      }}
                    >
                      {average}%
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="w-24 shrink-0 pl-2 text-center">
                    {cells.filter(c => c.percentage !== null).length < 2 ? (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Cần ≥ 2 bài</span>
                    ) : trend > 5 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>+{trend}%</span>
                      </span>
                    ) : trend < -5 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#b04848] dark:text-[#f0a8a8] bg-[#fdf2f4] dark:bg-[#351e24] px-2 py-0.5 rounded-lg border border-[#f5c6cb] dark:border-[#522b34]">
                        <TrendingDown className="w-3.5 h-3.5 text-[#b04848] dark:text-[#f0a8a8]" />
                        <span>{trend}%</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        <Minus className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ổn định</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Hover Detail Card */}
      {hoveredCell && (
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-700 animate-in fade-in duration-150">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#4f80b9]/30 text-[#dceeff] border border-[#7da7d9]/30">
                Bài thi #{hoveredCell.examIndex} • {hoveredCell.dateStr}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {hoveredCell.examTitle} (Điểm: <strong className="text-white font-mono">{hoveredCell.score10.toFixed(1)}/10</strong>)
              </span>
            </div>

            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{hoveredCell.categoryLabel}</span>
              {hoveredCell.percentage !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-extrabold ${
                    hoveredCell.percentage >= 75
                      ? 'bg-emerald-500 text-white'
                      : hoveredCell.percentage >= 50
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-[#c25e5e] text-white'
                  }`}
                >
                  {hoveredCell.percentage >= 75
                    ? 'Xuất sắc'
                    : hoveredCell.percentage >= 50
                    ? 'Đạt yêu cầu'
                    : 'Cần ôn luyện'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hoveredCell.percentage !== null ? (
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {hoveredCell.percentage}%
                </span>
                <span className="text-xs text-slate-300 block">
                  Đúng {hoveredCell.correct} trên {hoveredCell.total} câu
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Bài thi này không có câu hỏi thuộc nhóm này
              </span>
            )}

            {onSelectExam && (
              <button
                onClick={() => onSelectExam(hoveredCell.examResult)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4f80b9] hover:bg-[#4372a7] text-white text-xs font-bold transition-colors"
              >
                <span>Xem lại bài</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend & Instructions Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 dark:text-slate-300">Thang đo màu sắc:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#f8d7da] border border-[#f5c6cb] inline-block" />
            <span>0 - 49% (Chưa đạt)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300 inline-block" />
            <span>50 - 74% (Đạt)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-200 border border-emerald-300 inline-block" />
            <span>75 - 100% (Giỏi/Xuất sắc)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block" />
            <span>(—) Không có câu</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Nhấp vào ô bất kỳ để xem lại bài thi</span>
        </div>
      </div>
    </div>
  );
};
