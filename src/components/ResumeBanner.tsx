import React from 'react';
import { PlayCircle, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { ActiveExamSession } from '../types/quiz';
import { formatTime } from '../utils/examEngine';

interface ResumeBannerProps {
  session: ActiveExamSession;
  onResume: () => void;
  onDiscard: () => void;
}

export const ResumeBanner: React.FC<ResumeBannerProps> = ({ session, onResume, onDiscard }) => {
  const answeredCount = Object.keys(session.userAnswers).length;
  const totalCount = session.questions.length;
  const percentage = Math.round((answeredCount / totalCount) * 100);

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border-b border-amber-300/60 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 animate-pulse">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-sm">
                Bài thi dở dang
              </span>
              <h3 className="text-sm font-semibold text-slate-900">
                {session.config.title || 'Bài thi trắc nghiệm'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Đã làm <strong className="text-slate-900">{answeredCount}/{totalCount}</strong> câu ({percentage}%)
              </span>
              {session.totalDurationSeconds > 0 && (
                <span>• Còn lại: <strong className="text-amber-800">{formatTime(session.remainingSeconds)}</strong></span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onDiscard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-white/80 rounded-lg transition-colors border border-transparent hover:border-slate-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hủy bỏ</span>
          </button>
          <button
            onClick={onResume}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-xs transition-all hover:shadow-md"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Tiếp tục làm ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
