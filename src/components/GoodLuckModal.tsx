import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  Send,
  Sparkles,
  Star,
  X
} from 'lucide-react';
import {
  QUICK_REVIEW_TAGS,
  submitCommunityReview
} from '../utils/reviewsService';
import { StickerSquadOverlay } from './StickerSquadOverlay';

interface GoodLuckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
  5: '5 Sao · Tuyệt vời! 🌟',
  4: '4 Sao · Rất tốt ✨',
  3: '3 Sao · Khá ổn 👍',
  2: '2 Sao · Cần cải thiện 💡',
  1: '1 Sao · Chưa hài lòng 🛠️'
};

export const GoodLuckModal: React.FC<GoodLuckModalProps> = ({
  isOpen,
  onClose
}) => {
  const [authorName, setAuthorName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>(QUICK_REVIEW_TAGS[0]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Continuous Festival Fireworks Effect
  useEffect(() => {
    if (!isOpen) return;

    // Rich opening burst
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f80b9', '#fbbf24', '#34d399', '#f43f5e', '#a855f7']
      });
    } catch {
      // ignore in headless
    }

    // Continuous alternating festival fireworks every 1.6s throughout modal open
    let leftTurn = true;
    const intervalId = setInterval(() => {
      try {
        if (leftTurn) {
          confetti({
            particleCount: 35,
            angle: 60,
            spread: 55,
            origin: { x: 0.05, y: 0.75 },
            colors: ['#4f80b9', '#fbbf24', '#34d399', '#f43f5e']
          });
        } else {
          confetti({
            particleCount: 35,
            angle: 120,
            spread: 55,
            origin: { x: 0.95, y: 0.75 },
            colors: ['#fbbf24', '#a855f7', '#34d399', '#60a5fa']
          });
        }
        leftTurn = !leftTurn;
      } catch {
        // ignore in headless
      }
    }, 1600);

    return () => {
      clearInterval(intervalId);
    };
  }, [isOpen]);

  const activeStarValue = hoverRating ?? rating;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await submitCommunityReview({
        authorName,
        rating,
        comment: comment.trim() || selectedTag,
        quickTag: selectedTag
      });

      setComment('');
      setSubmitSuccess(true);

      try {
        confetti({
          particleCount: 50,
          spread: 65,
          origin: { y: 0.55 }
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        onClose();
        const footerEl = document.getElementById('community-reviews-footer');
        if (footerEl) {
          footerEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Không thể gửi đánh giá lúc này. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#152230]/75 backdrop-blur-md overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="good-luck-modal-title"
        >
          {/* Relative wrapper for modal + 360° mascot squad + backdrop stickers */}
          <div className="relative w-full max-w-lg">
            {/* Squad of 5 Animated Peeking Mascots + Floating Party Overlay */}
            <StickerSquadOverlay />

            {/* Main Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full rounded-2xl bg-[var(--card-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden"
            >
              {/* Top decorative gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#4f80b9] via-[#fbbf24] to-[#34d399]" />

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng cửa sổ"
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-4 sm:p-5">
                {/* Mobile mini sticker row */}
                <div className="flex sm:hidden items-center justify-between gap-1.5 mb-2.5 overflow-x-auto pb-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                    🍀 May Mắn 100%
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 shrink-0">
                    💯 Chắc Suất A+
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-bold border border-sky-500/20 shrink-0">
                    🚀 Về Đích
                  </span>
                </div>

                {/* Compact Header */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
                    <Award className="w-5 h-5" />
                    <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-amber-500 fill-amber-400 animate-pulse" />
                  </div>
                  <div className="pr-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2
                        id="good-luck-modal-title"
                        className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] leading-tight"
                      >
                        Chúc Bạn Ôn Thi Tốt & Đạt Điểm A+!
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold border border-rose-500/25 select-none shrink-0">
                        🎯 MỤC TIÊU 10 ĐIỂM
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      Tự tin chinh phục 299 câu hỏi SQA. Hãy dành 5s đánh giá nhanh trang web nhé:
                    </p>
                  </div>
                </div>

                {/* Compact 1-Tap Form */}
                <form onSubmit={handleSubmitReview} className="space-y-2.5">
                  {/* Balanced Star Rating Box (Left: Stars, Right: Dynamic Label) */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => {
                        const active = star <= activeStarValue;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            aria-label={`Chọn ${star} sao`}
                            className="p-1 rounded-md hover:scale-120 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                active
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 tracking-tight text-right">
                      {RATING_LABELS[activeStarValue]}
                    </span>
                  </div>

                  {/* Quick Tags Chips */}
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_REVIEW_TAGS.map(tag => {
                        const isSelected = selectedTag === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(tag)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                              isSelected
                                ? 'bg-[#4f80b9] text-white shadow-xs font-semibold'
                                : 'bg-[var(--bg-canvas)] text-slate-600 dark:text-slate-300 border border-[var(--border-subtle)] hover:bg-[var(--hover-bg)]'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2-Column Compact Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="popup-reviewer-name"
                        className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5"
                      >
                        Tên bạn <span className="text-slate-400">(tùy chọn)</span>:
                      </label>
                      <input
                        id="popup-reviewer-name"
                        type="text"
                        maxLength={40}
                        value={authorName}
                        onChange={e => setAuthorName(e.target.value)}
                        placeholder="VD: Minh Quân"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4f80b9]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="popup-reviewer-comment"
                        className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5"
                      >
                        Góp ý nhanh <span className="text-slate-400">(tùy chọn)</span>:
                      </label>
                      <input
                        id="popup-reviewer-comment"
                        type="text"
                        maxLength={400}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Góp ý hoặc để trống..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4f80b9]"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                      {submitError}
                    </p>
                  )}

                  {submitSuccess && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Đã lưu đánh giá! Đang chuyển vào ôn thi...</span>
                    </div>
                  )}

                  {/* Compact Action Buttons */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="submit"
                      disabled={isSubmitting || submitSuccess}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#4f80b9] to-[#3f6ca0] hover:from-[#3f6ca0] hover:to-[#315682] disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-98"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá & Vào Thi'}
                      <span className="text-xs">✨</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-medium text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Để Sau, Vào Thi Ngay
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
