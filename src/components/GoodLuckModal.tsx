import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  Send,
  Star,
  X
} from 'lucide-react';
import {
  QUICK_REVIEW_TAGS,
  submitCommunityReview
} from '../utils/reviewsService';

interface GoodLuckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
  5: '5 Sao · Tuyệt vời, rất hữu ích!',
  4: '4 Sao · Tốt, ôn tập hiệu quả',
  3: '3 Sao · Khá ổn',
  2: '2 Sao · Cần cải thiện thêm',
  1: '1 Sao · Chưa hài lòng'
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

  useEffect(() => {
    if (!isOpen) return;

    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#4f80b9', '#fbbf24', '#34d399', '#60a5fa']
      });
    } catch {
      // ignore confetti error in headless environments
    }
  }, [isOpen]);

  const activeStarValue = hoverRating ?? rating;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!comment.trim()) {
      setSubmitError('Bạn hãy nhập lời nhận xét hoặc lời chúc thi tốt trước khi gửi nhé!');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCommunityReview({
        authorName,
        rating,
        comment,
        quickTag: selectedTag
      });

      setComment('');
      setSubmitSuccess(true);

      try {
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.6 }
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
      }, 1200);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152230]/65 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="good-luck-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl rounded-2xl bg-[var(--card-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden my-auto"
          >
            {/* Top accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#4f80b9] via-[#fbbf24] to-[#4f80b9]" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7">
              {/* Good Luck Header */}
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#fff7cc] dark:bg-amber-500/20 border border-amber-300/60 dark:border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="pr-6">
                  <p className="text-xs font-semibold text-[#4f80b9] dark:text-[#7da7d9]">
                    SQA Quiz Pro · Lời chúc gửi sĩ tử
                  </p>
                  <h2
                    id="good-luck-modal-title"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]"
                    style={{ textWrap: 'balance' }}
                  >
                    Chúc Bạn Ôn Tập Tốt & Thi Đạt A+!
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                Chúc bạn bình tĩnh, tự tin chinh phục trọn vẹn 299 câu hỏi môn{' '}
                <strong className="text-[var(--text-primary)] font-semibold">
                  Đảm Bảo Chất Lượng Phần Mềm (SQA)
                </strong>
                . Hãy để lại đánh giá cho trang web hoặc gửi lời chúc thi tốt tới mọi người bên dưới
                nhé (hiển thị trực tiếp ở Footer cuối trang)!
              </p>

              {/* Integrated Review Form */}
              <form
                onSubmit={handleSubmitReview}
                className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3.5"
              >
                {/* Star Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Đánh giá của bạn về trang web:
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)]">
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
                            className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                active
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-300">
                      {RATING_LABELS[activeStarValue]}
                    </span>
                  </div>
                </div>

                {/* Quick Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Nhãn cảm nhận nhanh:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REVIEW_TAGS.map(tag => {
                      const isSelected = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTag(tag)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-[#4f80b9] text-white'
                              : 'bg-[var(--card-surface)] text-slate-600 dark:text-slate-300 border border-[var(--border-subtle)] hover:bg-[var(--hover-bg)]'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Author Name */}
                <div>
                  <label
                    htmlFor="popup-reviewer-name"
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                  >
                    Tên hoặc biệt danh của bạn:
                  </label>
                  <input
                    id="popup-reviewer-name"
                    type="text"
                    maxLength={40}
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="VD: Minh Quân (để trống sẽ ghi Sĩ tử SQA)"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4f80b9]"
                  />
                </div>

                {/* Comment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="popup-reviewer-comment"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Nhận xét hoặc lời chúc thi tốt:
                    </label>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {comment.length}/400
                    </span>
                  </div>
                  <textarea
                    id="popup-reviewer-comment"
                    rows={3}
                    maxLength={400}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Nhập đánh giá về trang web hoặc gửi lời chúc thi tốt tới các bạn khác..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4f80b9] resize-none"
                  />
                </div>

                {submitError && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {submitError}
                  </p>
                )}

                {submitSuccess && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Đã lưu đánh giá thành công! Đang chuyển tới danh sách đánh giá...</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || submitSuccess}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f80b9] hover:bg-[#3f6ca0] disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá & Vào Ôn Tập'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-[var(--card-surface)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Để Sau, Vào Ôn Tập Ngay
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
