import React from 'react';
import {
  History,
  Award,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ExamResult, Question } from '../types/quiz';
import { formatTime, getGradeEvaluation, generateSampleHistoryData } from '../utils/examEngine';
import { deleteExamResult, clearExamHistory, saveExamResult } from '../utils/storage';
import { HistoryHeatmap } from './HistoryHeatmap';

interface HistoryViewProps {
  history: ExamResult[];
  questions: Question[];
  onRefreshHistory: () => void;
  onViewResult: (result: ExamResult) => void;
  onStartExam: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  questions,
  onRefreshHistory,
  onViewResult,
  onStartExam
}) => {
  const totalExams = history.length;

  const averageScore =
    totalExams > 0
      ? (history.reduce((sum, h) => sum + h.score10, 0) / totalExams).toFixed(1)
      : '0.0';

  const bestScore =
    totalExams > 0 ? Math.max(...history.map(h => h.score10)).toFixed(1) : '0.0';

  const passedExams = history.filter(h => h.passed).length;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

  const totalQuestionsDone = history.reduce((sum, h) => sum + h.totalQuestions, 0);

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi bài thi này khỏi lịch sử?')) {
      deleteExamResult(id);
      onRefreshHistory();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử các lần thi? Thao tác này không thể hoàn tác.')) {
      clearExamHistory();
      onRefreshHistory();
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Lịch Sử Làm Bài & Báo Cáo
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi quá trình tiến bộ qua từng bài kiểm tra và xem lại chi tiết bài làm bất kỳ lúc nào
          </p>
        </div>

        {totalExams > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa toàn bộ lịch sử</span>
          </button>
        )}
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng số bài thi
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalExams}
            </span>
            <span className="text-xs text-slate-500">lần thi</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Đã làm {totalQuestionsDone} lượt câu hỏi
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Điểm trung bình
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
              {averageScore}
            </span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Trên tổng số {totalExams} bài đã nộp
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Điểm cao nhất
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {bestScore}
            </span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Kỷ lục thành tích
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Tỷ lệ đạt chuẩn
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {passRate}%
            </span>
            <span className="text-xs text-slate-500">({passedExams}/{totalExams})</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Ngưỡng đạt: ≥ 5.0 điểm
          </span>
        </div>
      </div>

      {/* Visual D3 Heat Map of Knowledge Categories Performance Over Time */}
      {totalExams > 0 && (
        <HistoryHeatmap
          history={history}
          onSelectExam={onViewResult}
        />
      )}

      {/* History Items List */}
      <div className="space-y-4">
        {totalExams === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Chưa có bài thi nào được ghi nhận
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Hãy bắt đầu làm bài kiểm tra thử nghiệm để hệ thống tự động ghi lại lịch sử và phân tích biểu đồ nhiệt độ năng lực của bạn.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onStartExam}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Bắt Đầu Làm Bài Thi Ngay</span>
              </button>
              <button
                onClick={() => {
                  if (questions && questions.length > 0) {
                    const samples = generateSampleHistoryData(questions);
                    samples.forEach(s => saveExamResult(s));
                    onRefreshHistory();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Nạp 3 bài thi mẫu để xem Biểu Đồ Nhiệt</span>
              </button>
            </div>
          </div>
        ) : (
          history.map(item => {
            const evalInfo = getGradeEvaluation(item.score10);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left Exam Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        item.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.passed ? 'ĐẠT' : 'CHƯA ĐẠT'} ({evalInfo.label})
                    </span>

                    <span className="text-xs font-semibold text-slate-500">
                      {formatDate(item.completedAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>
                      Kết quả: <strong className="text-slate-800">{item.correctCount}/{item.totalQuestions}</strong> câu đúng ({item.percentage}%)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatTime(item.timeSpentSeconds)}
                    </span>
                  </div>
                </div>

                {/* Right Score & Actions */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        {item.score10.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">/10</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewResult(item)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      title="Xem báo cáo chi tiết"
                    >
                      <span>Xem lại</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Xóa bài này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
