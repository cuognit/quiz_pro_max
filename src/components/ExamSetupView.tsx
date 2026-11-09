import React, { useState } from 'react';
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
  Check
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

  // Launch preset
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Hero Welcome & Subject Info */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8 border border-indigo-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-4 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Học phần: Đánh giá và kiểm định chất lượng phần mềm (SQA)
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Luyện Thi Trắc Nghiệm Trực Tuyến & Chấm Điểm Tự Động
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Hệ thống tích hợp trọn bộ <strong>{questions.length} câu hỏi</strong> chính thức
            được phân bố theo 6 nhóm, 2 chuẩn đầu ra (CĐR 1.1 & CĐR 2.1), đầy đủ biểu đồ CFG,
            luồng dữ liệu, thuật toán kiểm thử và tính năng lưu bài làm dở dang.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartStandard}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Vào Thi Đề Chuẩn (50 Câu / 60 Phút)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('custom')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-xs border border-white/20 transition-colors"
            >
              <Target className="w-4 h-4 text-indigo-300" />
              <span>Cài Đặt Tùy Chỉnh Số Câu & Phút</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveSubTab('standard')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'standard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Cấu Trúc Đề Chuẩn (50 Câu)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('custom')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'custom'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tự Setup Số Câu & Thời Gian</span>
        </button>
      </div>

      {activeSubTab === 'standard' ? (
        <div className="space-y-8">
          {/* Official Syllabus Structure Details */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Cấu Trúc Đề Thi Chuẩn Theo Quy Định
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Đề thi gồm đúng 50 câu được trích ngẫu nhiên theo ma trận tỷ lệ các nhóm
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  50 Câu hỏi
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  60 Phút
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  Thang điểm 10
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nhóm câu hỏi</th>
                    <th className="py-3 px-4">Chuẩn đầu ra</th>
                    <th className="py-3 px-4">Mức độ khó</th>
                    <th className="py-3 px-4 text-center">Số câu trong đề</th>
                    <th className="py-3 px-4 text-center">Ngân hàng có</th>
                    <th className="py-3 px-4 text-right">Điểm số ước tính</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Group 1</td>
                    <td className="py-3 px-4 text-blue-700 font-medium">CĐR 1.1</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-sm text-xs bg-emerald-100 text-emerald-800">DỄ</span></td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">10 câu</td>
                    <td className="py-3 px-4 text-center text-slate-500">49 câu</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-semibold">2.0 đ</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Group 2</td>
                    <td className="py-3 px-4 text-blue-700 font-medium">CĐR 1.1</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-sm text-xs bg-amber-100 text-amber-800">TRUNG BÌNH</span></td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">15 câu</td>
                    <td className="py-3 px-4 text-center text-slate-500">97 câu</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-semibold">3.0 đ</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Group 3</td>
                    <td className="py-3 px-4 text-blue-700 font-medium">CĐR 1.1</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-sm text-xs bg-rose-100 text-rose-800">KHÓ</span></td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">3 câu</td>
                    <td className="py-3 px-4 text-center text-slate-500">19 câu</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-semibold">0.6 đ</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Group 4</td>
                    <td className="py-3 px-4 text-purple-700 font-medium">CĐR 2.1</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-sm text-xs bg-emerald-100 text-emerald-800">DỄ</span></td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">5 câu</td>
                    <td className="py-3 px-4 text-center text-slate-500">20 câu</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-semibold">1.0 đ</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Group 5</td>
                    <td className="py-3 px-4 text-purple-700 font-medium">CĐR 2.1</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-sm text-xs bg-amber-100 text-amber-800">TRUNG BÌNH</span></td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">12 câu</td>
                    <td className="py-3 px-4 text-center text-slate-500">74 câu</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-semibold">2.4 đ</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Group 6</td>
                    <td className="py-3 px-4 text-purple-700 font-medium">CĐR 2.1</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-sm text-xs bg-rose-100 text-rose-800">KHÓ</span></td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">5 câu</td>
                    <td className="py-3 px-4 text-center text-slate-500">40 câu</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-semibold">1.0 đ</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-900">
                  <tr>
                    <td colSpan={3} className="py-3 px-4">
                      Tổng cộng (CĐR 1.1: 28 câu = 5.6đ | CĐR 2.1: 22 câu = 4.4đ)
                    </td>
                    <td className="py-3 px-4 text-center text-indigo-700 text-base">50 câu</td>
                    <td className="py-3 px-4 text-center text-slate-600">299 câu</td>
                    <td className="py-3 px-4 text-right text-emerald-700 text-base">10.0 đ</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleStartStandard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Bắt Đầu Làm Bài Ngay</span>
              </button>
            </div>
          </div>

          {/* Quick Study Presets */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Hoặc Chọn Các Chế Độ Luyện Tập Nhanh Phổ Biến
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Luyện Tốc Độ
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  15 câu hỏi trọng tâm trong 15 phút, rèn luyện phản xạ nhanh.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-amber-700">
                  <span>15 câu</span> • <span>15 phút</span>
                </div>
              </div>

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
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  Chinh Phục Câu Khó
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tập trung câu hỏi nhóm 3 & 6: Độ phức tạp Cyclomatic, CFG, DFG.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-rose-700">
                  <span>20 câu</span> • <span>30 phút</span> • <span>Mức KHÓ</span>
                </div>
              </div>

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
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Luyện Tập Kèm Giải Thích
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Không bấm giờ, chọn đáp án là biết đúng sai và học ngay lý thuyết.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-700">
                  <span>25 câu</span> • <span>Không giới hạn</span> • <span>Hiện đáp án</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Custom Setup View */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Tùy Chỉnh Cấu Hình Bài Kiểm Tra
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tự do chọn số phút, số lượng câu trắc nghiệm và phạm vi kiến thức bạn muốn ôn luyện
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Count & Time */}
            <div className="space-y-6">
              {/* Question Count Setting */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    Số lượng câu hỏi:
                  </label>
                  <span className="text-lg font-extrabold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg">
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
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {[10, 20, 30, 50, 100, questions.length].map(val => (
                    <button
                      key={val}
                      onClick={() => setQuestionCount(val)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                        questionCount === val
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val === questions.length ? `Tất cả (${val})` : `${val} câu`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Duration Setting */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Thời gian làm bài:
                  </label>
                  <span className="text-lg font-extrabold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg">
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
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {[0, 15, 30, 45, 60, 90].map(val => (
                    <button
                      key={val}
                      onClick={() => setDurationMinutes(val)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                        durationMinutes === val
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val === 0 ? 'Không giới hạn' : `${val} phút`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Options */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tùy chọn hiển thị
                </h4>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={e => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <Shuffle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Đảo ngẫu nhiên thứ tự câu hỏi</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={immediateFeedback}
                    onChange={e => setImmediateFeedback(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Chế độ Luyện tập: Hiện đáp án đúng & giải thích ngay sau mỗi câu</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Column: Group Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <label className="text-sm font-bold text-slate-900 block">
                  Chọn Nhóm câu hỏi (Group):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllGroups}
                    className="text-xs px-2.5 py-1 rounded-md font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllGroups}
                    className="text-xs px-2.5 py-1 rounded-md font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 mb-2">
                Đã chọn <strong className="text-indigo-600 font-bold">{selectedGroups.length}/6</strong> nhóm ({groupStats.filter(g => selectedGroups.includes(g.group)).reduce((sum, g) => sum + g.count, 0)} câu hỏi sẵn sàng)
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {groupStats.map(gs => {
                  const isSelected = selectedGroups.includes(gs.group);
                  return (
                    <button
                      key={gs.group}
                      type="button"
                      onClick={() => toggleGroup(gs.group)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          Group {gs.group}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                          gs.diff === 'DỄ'
                            ? 'bg-emerald-100 text-emerald-800'
                            : gs.diff === 'TRUNG BÌNH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {gs.diff}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
                        <span className="font-medium text-slate-600">{gs.cdr}</span>
                        <span className="font-semibold text-slate-700">{gs.count} câu</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedGroups.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <span className="font-bold">Lưu ý:</span> Bạn chưa chọn nhóm nào. Hệ thống sẽ lấy ngẫu nhiên từ tất cả 6 nhóm khi bắt đầu.
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-slate-500">
              * Hệ thống sẽ tự động lưu lại bài làm dở dang nếu bạn thoát trang giữa chừng.
            </div>

            <button
              onClick={handleStartCustom}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Bắt Đầu Làm Bài Theo Cài Đặt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
