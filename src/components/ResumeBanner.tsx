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
    <div className="bg-[#fff7cc]/50 dark:bg-[#1c2c3d]/90 border-b border-[#fde047]/80 dark:border-[#293d52] px-4 py-3 sm:px-6 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fff7cc] dark:bg-[#fff7cc]/20 text-[#ca8a04] dark:text-[#fde047] flex items-center justify-center shrink-0 border border-[#fde047]/60 animate-pulse">
            <Clock className="w-5 h-5 text-[#ca8a04] dark:text-[#fde047]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#fff7cc] dark:bg-[#fff7cc]/20 text-[#713f12] dark:text-[#fff7cc] px-2.5 py-0.5 rounded-md border border-[#fde047]">
                Bài thi dở dang
              </span>
              <h3 className="text-sm font-bold text-[#1a2837] dark:text-[#f0f6fc]">
                {session.config.title || 'Bài thi trắc nghiệm'}
              </h3>
            </div>
            <p className="text-xs text-[#233446] dark:text-[#dceeff] mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4f80b9] dark:text-[#7da7d9]" />
                Đã làm <strong className="text-[#1a2837] dark:text-white font-bold">{answeredCount}/{totalCount}</strong> câu ({percentage}%)
              </span>
              {session.totalDurationSeconds > 0 && (
                <span>• Còn lại: <strong className="text-[#ca8a04] dark:text-[#fde047] font-mono font-bold">{formatTime(session.remainingSeconds)}</strong></span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onDiscard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#233446] dark:text-[#dceeff] hover:text-[#152230] hover:bg-white/60 dark:hover:bg-[#152230] rounded-xl transition-colors border border-transparent hover:border-[#dceeff] dark:hover:border-[#293d52]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hủy bỏ</span>
          </button>
          <button
            onClick={onResume}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#4f80b9] hover:bg-[#3d6e9f] dark:bg-[#4f80b9] dark:hover:bg-[#5f92cd] rounded-xl shadow-xs transition-all hover:scale-102"
          >
            <PlayCircle className="w-4 h-4 text-[#fff7cc]" />
            <span>Tiếp tục làm ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
